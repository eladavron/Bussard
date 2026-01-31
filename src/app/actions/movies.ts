'use server';

import { Movie } from "@/src/types/movie";
import { db } from "@/src/lib/db";

export type MovieInput = {
    title: string;
    description: string | null;
    year: number | null;
    runtime_min: number | null;
    imdb_id: string | null;
    directors: string[];
    actors: { name: string; character: string | null }[];
    writers: string[];
}

async function insertPeople(movie_id: string, names: string[], table: string, extra_data?: {key: string, value: any}[]) {
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

    await insertPeople(newID, movie.directors, 'directors');
    await insertPeople(newID, movie.writers, 'writers');
    await insertPeople(newID, movie.actors.map(actor => actor.name), 'actors', movie.actors.map(actor => ({ key: 'character_name', value: actor.character })));
    return newID;
}

export async function editMovie(movie: Movie) {
    // function implementation
}

export async function deleteMovie(movieId: string) {
    // function implementation
}
