'use server';

import { db } from '@/src/lib/db';
import { BackupMetadata } from '@/src/types/backup_metadata';
import { DBImage } from '@/src/types/db_image';
import { Disk } from '@/src/types/disk';
import { MimeType } from '@/src/types/mime';
import { Movie } from '@/src/types/movie';
import Papa from 'papaparse';
import { addMovie, inputFromOMDB } from './movies';
import { searchOMDB } from './omdb';
import { OMDBMovieExtended } from '@/src/types/omdb';
import { ImportError } from '@/src/types/import_error';

export async function startImport(formData: FormData): Promise<string> {
    // Generate UUID
    const uuid = crypto.randomUUID();
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
            throw new Error('No file uploaded');
        }
        const text = await file.text();
        if (file.type == MimeType.JSON) {
            const metadata: BackupMetadata = JSON.parse(text);
            console.log('Imported metadata:', metadata);
            //TODO: IMPLEMENT
        } else if (file.type == MimeType.CSV) {
            //For now assume it's libib
            const csvData = Papa.parse(text, { header: true });
            const rows = csvData.data as Record<string, string>[];
            for (const [index, row] of rows.entries()) {
                try {
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
                                _setWarning(importProgress.UUID, { message: `Movie with IMDB ID ${imdb_id} already exists, skipping import for "${title}".`, index, row });
                            }
                            continue;
                        }
                    } else if (title && year) {
                        const existingMovies = await db<Movie[]>`SELECT * FROM movies WHERE title = ${title} AND year = ${year}`;
                        if (existingMovies.length > 0) {
                            if (importProgress) {
                                _setWarning(importProgress.UUID, { message: `Movie with title "${title}" and year "${year}" already exists, skipping import.`, index, row });
                            }
                            continue;
                        }
                    }

                    //If there's an IMDB ID, use it to fetch metadata from OMDB and add the movie, otherwise skip
                    if (imdb_id) {
                        try {
                            const omdb_data = await searchOMDB(imdb_id) as OMDBMovieExtended;
                            const movieInput = await inputFromOMDB(omdb_data);
                            await addMovie(movieInput);
                        } catch (error) {
                            if (importProgress) {
                                _setError(importProgress.UUID, { message: `Failed to import "${title}" (${imdb_id}): ${error}`, index, row });
                            }
                        }
                    } else if (title && year) {
                        //If there's no IMDB ID but there's a title and year, try to find the movie on OMDB and add it
                        try {
                            const query = `${title} ${year}`;
                            const searchResults = await searchOMDB(query);
                            if ('Search' in searchResults && searchResults.Search.length > 0) {
                                const omdb_data = await searchOMDB(searchResults.Search[0].imdbID) as OMDBMovieExtended;
                                const movieInput = await inputFromOMDB(omdb_data);
                                await addMovie(movieInput);
                            } else {
                                if (importProgress) {
                                    _setError(importProgress.UUID, { message: `No OMDB results found for ${query}, skipping.`, index, row });
                                }
                            }
                        } catch (error) {
                            if (importProgress) {
                                _setError(importProgress.UUID, { message: `Failed to import movie with title "${title}" and year "${year}": ${error}`, index, row });
                            }
                        }
                    } else {
                        if (importProgress) {
                            _setError(importProgress.UUID, { message: `Row is missing both IMDB ID and title/year, skipping: ${JSON.stringify(row)}`, index, row });
                        }
                    }
                } catch (error) {
                    if (importProgress) {
                        _setError(importProgress.UUID, { message: `Failed to import row ${index + 1}: ${error} - ${JSON.stringify(row)}`, index, row });
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
            _setError(importProgress.UUID, { message: `Failed to import metadata: ${error}`, index: -1, row: {} });
        }
        if (importProgress) {
            _setProgress(importProgress.UUID, 100);
            _setProgressMessage(importProgress.UUID, 'Import complete with errors.');
        }
    }
}

export async function exportMetadataToFile() {
    //TODO: Figure out how to handle images

    const movies = await db<Movie[]>`SELECT * FROM movies`;
    const images = await db<DBImage[]>`SELECT * FROM images`;
    const people = await db<{ id: string; name: string }[]>`SELECT id, name FROM people`;
    const movieDisks = await db<Disk[]>`SELECT * FROM movie_disks`;
    const movieActors = await db<{ movie_id: string; person_id: string; character: string | null }[]>`SELECT movie_id, person_id, character_name AS character FROM movie_actors`;
    const movieWriters = await db<{ movie_id: string; person_id: string }[]>`SELECT movie_id, person_id FROM movie_writers`;
    const movieDirectors = await db<{ movie_id: string; person_id: string }[]>`SELECT movie_id, person_id FROM movie_directors`;
    //Save as JSON
    const metadata: BackupMetadata = {
        Movies: movies,
        Images: images,
        People: people,
        MovieDisks: movieDisks,
        MovieActors: movieActors,
        MovieWriters: movieWriters,
        MovieDirectors: movieDirectors,
    };
    return metadata;
};
