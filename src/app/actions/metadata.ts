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

export async function importMetadataFromFile(formData: FormData) {
    const file = formData.get('file') as File;

    if (!file || file.size === 0) {
        throw new Error('No file uploaded');
    }
    const text = await file.text();
    if (file.type == MimeType.JSON) {
        const metadata: BackupMetadata = JSON.parse(text);
        console.log('Imported metadata:', metadata);
    }
    else if (file.type == MimeType.CSV) {
        //For now assume it's libib
        const csvData = Papa.parse(text, { header: true });
        for (const row of csvData.data) {
            const imdb_id = row['imdb id (movie)']; //This requires a custom imdb_id column in libib
            const title = row.title;
            const year = row.publish_date ? parseInt(/\d{4}/.exec(row.publish_date)![0]) : null; //Extract just the year from the string, since libib exports it as "Year: 1999"

            //If there's an IMDB ID, use it to fetch metadata from OMDB and add the movie, otherwise skip
            if (imdb_id) {
                try {
                    const omdb_data = await searchOMDB(imdb_id) as OMDBMovieExtended;
                    const movieInput = await inputFromOMDB(omdb_data);
                    await addMovie(movieInput);
                } catch (error) {
                    console.error(`Failed to import movie with IMDB ID ${imdb_id}:`, error);
                }
            }
            else if (title && year) {
                //If there's no IMDB ID but there's a title and year, try to find the movie on OMDB and add it
                try {
                    const query = `${title} ${year}`;
                    const searchResults = await searchOMDB(query);
                    if ('Search' in searchResults && searchResults.Search.length > 0) {
                        const omdb_data = await searchOMDB(searchResults.Search[0].imdbID) as OMDBMovieExtended;
                        const movieInput = await inputFromOMDB(omdb_data);
                        await addMovie(movieInput);
                    } else {
                        console.warn(`No OMDB results found for ${query}, skipping.`);
                    }
                } catch (error) {
                    console.error(`Failed to import movie with title "${title}" and year "${year}":`, error);
                }
            }
            else {
                console.warn('Row is missing both IMDB ID and title/year, skipping:', row);
            }
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
    //Save as JSON
    const json = JSON.stringify(metadata, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    return blob;
};
