'use server';

import { Movie, MovieInput } from '@/src/types/movie';
import { db } from '@/src/lib/db';
import { addMovieImageFromURL } from './images';
import { OMDBMovieExtended } from '@/src/types/omdb';
import { serverLogger as logger } from '@/src/lib/serverLogger';

export async function getMovies(): Promise<Movie[]> {
    const movies = await db<Movie[]>`SELECT * FROM movie_overview ORDER BY title ASC`;
    return movies;
}

export async function inputFromOMDB(movie: OMDBMovieExtended): Promise<MovieInput> {
    const input: MovieInput = {
        title: movie.Title,
        description: movie.Plot || null,
        year: movie.Year ? parseInt(movie.Year) : null,
        runtime_min: movie.Runtime ? parseInt(movie.Runtime) : null,
        imdb_id: movie.imdbID || null,
        directors: movie.Director ? movie.Director.split(',').map(d => d.trim()) : [],
        actors: movie.Actors ? movie.Actors.split(',').map(a => ({ name: a.trim(), character: null })) : [],
        writers: movie.Writer ? movie.Writer.split(',').map(w => w.trim()) : [],
        poster_image_url: movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : null,
    };
    return input;
}

async function addPeople(movie_id: string, names: string[], table: string, extra_data?: { key: string, value: string }[]) {
    const personType = table.slice(0, -1); // Remove plural 's' to get person type (director, actor, writer)
    for (const name of names) {
        await logger.info(`Adding ${personType} "${name}" to movie ID ${movie_id}`);
        const people = await db`SELECT id FROM people WHERE name = ${name as string}`;
        let personID: string;
        if (people.length === 0) {
            const insertResult = await db`INSERT INTO people (name) VALUES (${name as string}) RETURNING id`;
            personID = insertResult[0].id;
            await logger.info(`No existing ${personType} found with name "${name}", created new entry with ID ${personID}`);
        } else {
            await logger.info(`Found existing ${personType} with name "${name}", using ID ${people[0].id}`);
            personID = people[0].id;
        }
        const tableName = `movie_${table}`;
        await db`INSERT INTO ${db(tableName)} (movie_id, person_id) VALUES (${movie_id}, ${personID})`;
        await logger.info(`Linked ${personType} ID ${personID} to movie ID ${movie_id} in table ${tableName}`);
        if (extra_data) {
            await logger.info(`Adding extra data for ${personType} "${name}" in movie ID ${movie_id}: ${JSON.stringify(extra_data)}`);
            for (const data of extra_data) {
                const updateTableName = `movie_${table}`;
                await db`UPDATE ${db(updateTableName)} SET ${db(data.key)} = ${data.value} WHERE movie_id = ${movie_id} AND person_id = ${personID}`;
            }
        }
    }
}

export async function addMovie(movie: MovieInput): Promise<string> {
    const newItem = await db`INSERT INTO movies (title, description, year, runtime_min, imdb_id) VALUES (
        ${movie.title},
        ${movie.description},
        ${movie.year},
        ${movie.runtime_min ? movie.runtime_min : null},
        ${movie.imdb_id}
    ) RETURNING id`;
    const newID = newItem[0].id;
    await logger.info(`Added movie "${movie.title}" with ID ${newID} to the database`);

    if (movie.directors.length === 0) {
        await logger.warn(`No directors provided for movie "${movie.title}" (ID ${newID})`);
    }
    else{
        await addPeople(newID, movie.directors, 'directors');
    }
    if (movie.writers.length === 0) {
        await logger.warn(`No writers provided for movie "${movie.title}" (ID ${newID})`);
    }
    else{
        await addPeople(newID, movie.writers, 'writers');
    }
    for (const actor of movie.actors) {
        if (actor.character) {
            await addPeople(newID, [actor.name], 'actors', [{ key: 'character_name', value: actor.character }]);
        } else {
            await addPeople(newID, [actor.name], 'actors');
        }
    }
    if (movie.poster_image_url) {
    //Upload poster image
        try {
            await addMovieImageFromURL(newID, movie.poster_image_url);
        } catch (error) {
            await logger.error(`Failed to add poster image from URL ${movie.poster_image_url} for movie ID ${newID}: ${error}`, {error: error});
        }
    }
    else {
        await logger.warn(`No poster image URL provided for movie "${movie.title}" (ID ${newID})`);
    }
    return newID;
}

export async function getMovieByIMDBID(imdb_id: string): Promise<Movie | null> {
    const movies = await db<Movie[]>`SELECT * FROM movie_overview WHERE imdb_id = ${imdb_id}`;
    if (movies.length === 0) {
        await logger.info(`No movie found in our database with IMDB ID ${imdb_id}`);
        return null;
    }
    await logger.info(`Found movie in our database with IMDB ID ${imdb_id}: "${movies[0].title}" (ID ${movies[0].id})`);
    return movies[0];
}

export async function editMovie(movie: Movie): Promise<void> {
    await db`UPDATE movies SET title = ${movie.title}, description = ${movie.description}, year = ${movie.year}, runtime_min = ${movie.runtime_min}, imdb_id = ${movie.imdb_id} WHERE id = ${movie.id}`;
    await logger.info(`Updated movie "${movie.title}" (ID ${movie.id}) in the database`);
}

export async function deleteMovie(movie_id: string): Promise<void> {
    await db`DELETE FROM movies WHERE id = ${movie_id}`;
    await logger.warn(`Deleted movie with ID ${movie_id} from the database`);
}