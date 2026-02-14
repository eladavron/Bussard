'use server';

import { db } from '@/src/lib/db';
import { MimeType } from '@/src/types/mime';
import { Movie, MovieInput } from '@/src/types/movie';
import Papa from 'papaparse';
import { addMovie, inputFromOMDB } from './movies';
import { searchOMDB } from './omdb';
import { OMDBMovieExtended } from '@/src/types/omdb';
import { ImportError } from '@/src/types/import_error';
import { addImageFromBuffer, setMoviePoster } from './images';
import { addDisk } from './disks';
import { serverLogger as logger } from '@/src/lib/serverLogger';

export async function startImport(formData: FormData): Promise<string> {
    // Generate UUID
    const uuid = crypto.randomUUID();
    logger.info(`Starting metadata import with UUID: ${uuid}`);
    // Start the import process asynchronously
    importMetadataFromFile(formData, { ...defaultImportProgress, UUID: uuid });
    // Return the UUID to the client
    return uuid;
}

const importProgressStore: Record<string, ImportProgress> = {};
const defaultImportProgress: ImportProgress = { UUID: '', percentage: 0, message: 'Processing...', errors: [], warnings: [] };

function _setProgress(uuid: string, percentage: number) {
    if (!importProgressStore[uuid]) {
        importProgressStore[uuid] = { ...defaultImportProgress, UUID: uuid };
    }
    importProgressStore[uuid].percentage = percentage;
}

function _setProgressMessage(uuid: string, message: string) {
    if (!importProgressStore[uuid]) {
        importProgressStore[uuid] = { ...defaultImportProgress, UUID: uuid };
    }
    importProgressStore[uuid].message = message;
}

function _setWarning(uuid: string, warning: ImportError) {
    if (!importProgressStore[uuid]) {
        importProgressStore[uuid] = { ...defaultImportProgress, UUID: uuid };
    }
    importProgressStore[uuid].warnings.push(warning);
}

function _setError(uuid: string, error: ImportError) {
    if (!importProgressStore[uuid]) {
        importProgressStore[uuid] = { ...defaultImportProgress, UUID: uuid };
    }
    importProgressStore[uuid].errors.push(error);
}

export interface ImportProgress {
    UUID: string;
    percentage: number;
    message: string;
    errors: ImportError[];
    warnings: ImportError[];
}

export async function getImportProgress(uuid: string): Promise<ImportProgress> {
    return {
        UUID: uuid,
        percentage: importProgressStore[uuid]?.percentage || 0,
        message: importProgressStore[uuid]?.message || 'Processing...',
        errors: importProgressStore[uuid]?.errors || [],
        warnings: importProgressStore[uuid]?.warnings || [],
    };
}

export async function importMetadataFromFile(formData: FormData, importProgress?: ImportProgress) {
    try {
        const file = formData.get('file') as File;

        if (!file || file.size === 0) {
            const error = new Error('No file uploaded');
            logger.error(error.message);
            throw error;
        }
        const text = await file.text();
        if (file.type == MimeType.JSON) {
            logger.info('JSON file detected, assuming Bussard export...');
            const metadata = JSON.parse(text);
            //Assume it's Bussard export
            for (const [index, movie] of metadata.entries()) {
                try {
                    const percentage = Math.round(((index + 1) / metadata.length) * 100);
                    if (importProgress) {
                        _setProgress(importProgress.UUID, percentage);
                    }
                    if (importProgress) {
                        _setProgressMessage(importProgress.UUID, `Importing "${movie.title}"... (${index + 1}/${metadata.length})`);
                    }
                    logger.info(`Importing movie "${movie.title}" (${index + 1}/${metadata.length}) with IMDB ID ${movie.imdb_id}`);
                    //Assume each item is in the format of {...Movie, movie_poster: MoviePosterMeta}
                    const movieData = movie as Movie;
                    const existingMovies = await db<Movie[]>`SELECT * FROM movies WHERE title = ${movieData.title} AND year = ${movieData.year}`;
                    if (existingMovies.length > 0) {
                        const warningMessage = `Movie with title "${movieData.title}" and year "${movieData.year}" already exists, skipping.`;
                        if (importProgress) {
                            _setWarning(importProgress.UUID, { message: warningMessage, index, row: movieData });
                        }
                        logger.warn(warningMessage);
                        continue;
                    }
                    //Movie
                    const movieInput: MovieInput = {
                        title: movieData.title,
                        year: movieData.year,
                        imdb_id: movieData.imdb_id,
                        description: movieData.description,
                        actors: movieData.actors.map(actor => ({ name: actor.name, character: actor.character })),
                        directors: movieData.directors.map(director => director.name),
                        writers: movieData.writers.map(writer => writer.name),
                        poster_image_url: null, //Images are handled differently
                        runtime_min: movieData.runtime_min,
                    };
                    const newMovieId = await addMovie(movieInput);

                    //Poster
                    if (movie.poster_image) {
                        logger.info(`Adding poster image for movie "${movie.title}" with IMDB ID ${movie.imdb_id}`);
                        //Save poster image to database and link to movie
                        const buffer = Buffer.from(movie.poster_image.byte_data.slice(2), 'hex');
                        const mime_type = movie.poster_image.mime_type;
                        const width = movie.poster_image.width;
                        const height = movie.poster_image.height;
                        const byte_size = movie.poster_image.byte_size;
                        //Verify byte size is correct:
                        if (buffer.length !== byte_size) {
                            const warningMessage = `Byte size for poster image of "${movie.title}" does not match actual buffer size, using buffer size.`;
                            if (importProgress) {
                                _setWarning(importProgress.UUID, { message: warningMessage, index, row: movieData });
                            }
                            logger.warn(warningMessage);
                        }
                        const imageId = await addImageFromBuffer(buffer, mime_type, width, height);
                        await setMoviePoster(newMovieId, imageId);
                    }

                    //Disks
                    for (const disk of movie.disks) {
                        logger.info(`Adding disk for movie "${movie.title}" with IMDB ID ${movie.imdb_id}: format=${disk.format.name}, regions=${disk.regions?.map((r: { name: string, id: string }) => r.name).join(',')}`);
                        const format = disk.format.name;
                        const regions = disk.regions?.map((r: { name: string, id: string }) => r.name) || [];
                        addDisk(newMovieId, format, regions);
                    }

                } catch (error) {
                    const errorMessage = `Failed to import "${movie.title}": ${error instanceof Error ? error.message : error}`;
                    if (importProgress) {
                        _setError(importProgress.UUID, { message: errorMessage, index, row: movie });
                    }
                    logger.error(errorMessage);
                }
            }
            // Ensure progress is set to 100% after completion
            if (importProgress) {
                _setProgress(importProgress.UUID, 100);
                _setProgressMessage(importProgress.UUID, 'Import complete.');
            }
        } else if (file.type == MimeType.CSV) {
            //For now assume it's libib
            logger.info('CSV file detected, assuming libib export...');
            const csvData = Papa.parse(text, { header: true });
            const rows = csvData.data as Record<string, string>[];
            for (const [index, row] of rows.entries()) {
                try {
                    logger.info(`Processing row ${index + 1}/${rows.length}: ${JSON.stringify(row)}`);
                    const percentage = Math.round(((index + 1) / rows.length) * 100);
                    if (importProgress) {
                        _setProgress(importProgress.UUID, percentage);
                    }
                    if (importProgress) {
                        _setProgressMessage(importProgress.UUID, `Importing "${row.title}"... (${index + 1}/${rows.length})`);
                    }

                    const imdb_id = row['imdb id (movie)']; //This requires a custom imdb_id column in libib
                    const title = row.title;
                    let year: number | null = null;
                    try {
                        year = row.publish_date ? parseInt(/\d{4}/.exec(row.publish_date)![0]) : null; //Extract just the year from the string, since libib exports it as "Year: 1999"
                    } catch {
                        year = null;
                    }

                    //Check if doesn't exist already

                    if (imdb_id) {
                        const existingMovies = await db<Movie[]>`SELECT * FROM movies WHERE imdb_id = ${imdb_id}`;
                        if (existingMovies.length > 0) {
                            if (importProgress) {
                                const warningMessage = `Movie with IMDB ID ${imdb_id} already exists, skipping import for "${title}".`;
                                _setWarning(importProgress.UUID, { message: warningMessage, index, row });
                                logger.warn(warningMessage);
                            }
                            continue;
                        }
                    } else if (title && year) {
                        const existingMovies = await db<Movie[]>`SELECT * FROM movies WHERE title = ${title} AND year = ${year}`;
                        if (existingMovies.length > 0) {
                            if (importProgress) {
                                const warningMessage = `Movie with title "${title}" and year "${year}" already exists, skipping import.`;
                                _setWarning(importProgress.UUID, { message: warningMessage, index, row });
                                logger.warn(warningMessage);
                            }
                            continue;
                        }
                    }

                    //If there's an IMDB ID, use it to fetch metadata from OMDB and add the movie, otherwise skip
                    if (imdb_id) {
                        try {
                            logger.info(`Fetching metadata from OMDB for "${title}" with IMDB ID ${imdb_id}`);
                            const omdb_data = await searchOMDB(imdb_id) as OMDBMovieExtended;
                            const movieInput = await inputFromOMDB(omdb_data);
                            await addMovie(movieInput);
                        } catch (error) {
                            if (importProgress) {
                                const errorMessage = `Failed to import "${title}" (${imdb_id}): ${error}`;
                                _setError(importProgress.UUID, { message: errorMessage, index, row });
                                logger.error(errorMessage);
                            }
                        }
                    } else if (title && year) {
                        //If there's no IMDB ID but there's a title and year, try to find the movie on OMDB and add it
                        try {
                            const query = `${title} ${year}`;
                            logger.info(`Searching OMDB for "${query}"`);
                            const searchResults = await searchOMDB(query);
                            if ('Search' in searchResults && searchResults.Search.length > 0) {
                                const omdb_data = await searchOMDB(searchResults.Search[0].imdbID) as OMDBMovieExtended;
                                const movieInput = await inputFromOMDB(omdb_data);
                                await addMovie(movieInput);
                            } else {
                                if (importProgress) {
                                    const errorMessage = `No OMDB results found for ${query}, skipping.`;
                                    _setError(importProgress.UUID, { message: errorMessage, index, row });
                                    logger.error(errorMessage);
                                }
                            }
                        } catch (error) {
                            if (importProgress) {
                                const errorMessage = `Failed to import movie with title "${title}" and year "${year}": ${error}`;
                                _setError(importProgress.UUID, { message: errorMessage, index, row });
                                logger.error(errorMessage);
                            }
                        }
                    } else {
                        if (importProgress) {
                            const errorMessage = `Row is missing both IMDB ID and title/year, skipping: ${JSON.stringify(row)}`;
                            _setError(importProgress.UUID, { message: errorMessage, index, row });
                            logger.error(errorMessage);
                        }
                    }
                } catch (error) {
                    if (importProgress) {
                        const errorMessage = `Failed to import row ${index + 1}: ${error} - ${JSON.stringify(row)}`;
                        _setError(importProgress.UUID, { message: errorMessage, index, row });
                        logger.error(errorMessage);
                    }
                }
            }
            // Ensure progress is set to 100% after completion
            if (importProgress) {
                _setProgress(importProgress.UUID, 100);
                _setProgressMessage(importProgress.UUID, 'Import complete.');
            }
        }
    } catch (error) {
        console.error('Failed to import metadata:', error);
        if (importProgress) {
            const errorMessage = `Failed to import metadata: ${error instanceof Error ? error.message : error}`;
            _setError(importProgress.UUID, { message: errorMessage, index: -1, row: {} });
            logger.error(errorMessage);
        }
        if (importProgress) {
            _setProgress(importProgress.UUID, 100);
            _setProgressMessage(importProgress.UUID, 'Import complete with errors.');
        }
    }
}
