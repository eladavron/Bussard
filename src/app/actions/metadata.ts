'use server';

import { db } from '@/src/lib/db';
import { BackupMetadata } from '@/src/types/backup_metadata';
import { DBImage } from '@/src/types/db_image';
import { Disk } from '@/src/types/disk';
import { Movie } from '@/src/types/movie';

export async function importMetadataFromFile(formData: FormData) {
    const file = formData.get('metadata') as File;

    if (!file || file.size === 0) {
        throw new Error('No file uploaded');
    }
    const text = await file.text();
    const metadata: BackupMetadata = JSON.parse(text);
    console.log('Imported metadata:', metadata);
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
