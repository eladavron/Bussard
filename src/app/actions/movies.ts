'use server';

import { Movie } from "@/src/types/movie";
import { db } from "@/src/lib/db";
import { addMovieImageFromURL, uploadMovieImage } from "./images";

export async function getMovies(): Promise<Movie[]> {
    const movies = await db<Movie[]>`SELECT * FROM movie_overview ORDER BY title ASC`;
    return movies;
}

export async function clearDatabase(): Promise<void> {
    await db`DELETE FROM people`;
    await db`DELETE FROM movies`;
    await db`DELETE FROM movie_directors`;
    await db`DELETE FROM movie_actors`;
    await db`DELETE FROM movie_writers`;
    await db`DELETE FROM movie_disks`;
    await db`DELETE FROM images`;
}

export type MovieInput = {
    title: string;
    description: string | null;
    year: number | null;
    runtime_min: number | null;
    imdb_id: string | null;
    directors: string[];
    actors: { name: string; character: string | null }[];
    writers: string[];
    poster_image_url: string | null;
}

async function addPeople(movie_id: string, names: string[], table: string, extra_data?: {key: string, value: any}[]) {
    for (const name of names) {
        const people = await db`SELECT id FROM people WHERE name = ${name as string}`;
        let personID: string;
        if (people.length === 0) {
            const insertResult = await db`INSERT INTO people (name) VALUES (${name as string}) RETURNING id`;
            personID = insertResult[0].id;
        } else {
            personID = people[0].id;
        }
        const tableName = `movie_${table}`;
        await db`INSERT INTO ${db(tableName)} (movie_id, person_id) VALUES (${movie_id}, ${personID})`;
        if (extra_data) {
            for (const data of extra_data) {
                const updateTableName = `movie_${table}`;
                await db`UPDATE ${db(updateTableName)} SET ${db(data.key)} = ${data.value} WHERE movie_id = ${movie_id} AND person_id = ${personID}`;
            }
        }
    }
}

export async function addMovie(movie: MovieInput): Promise<string> {
    let newItem = await db`INSERT INTO movies (title, description, year, runtime_min, imdb_id) VALUES (
        ${movie.title},
        ${movie.description},
        ${movie.year},
        ${movie.runtime_min},
        ${movie.imdb_id}
    ) RETURNING id`;
    const newID = newItem[0].id;

    await addPeople(newID, movie.directors, 'directors');
    await addPeople(newID, movie.writers, 'writers');
    await addPeople(newID, movie.actors.map(actor => actor.name), 'actors', movie.actors.map(actor => ({ key: 'character_name', value: actor.character })));
    if (movie.poster_image_url) {
        //Upload poster image
        await addMovieImageFromURL(newID, movie.poster_image_url);
    }

    return newID;
}

export async function editMovie(movie: Movie) {
    // function implementation
}

export async function deleteMovie(movieId: string) {
    // function implementation
}
