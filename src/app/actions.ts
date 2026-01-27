'use server';

import ExifReader  from 'exifreader';
import { db } from '../lib/db';

export async function uploadMovieImage(movieId: string, formData: FormData) {
    //Check if movie already has a poster
    const poster = await db`SELECT poster_image_id FROM movies WHERE id = ${movieId}`;

    const file = formData.get('image') as File;

    if (!file || file.size === 0) {
        throw new Error('No file uploaded');
    }
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const tags = ExifReader.load(buffer);

    const mimeType = file.type;
    const width = Number(tags['Image Width']?.value ?? tags.ImageWidth?.value ?? 0);
    const height = Number(tags['Image Height']?.value ?? tags.ImageHeight?.value ?? 0);

    const result = await db<{ id: string }[]>`INSERT INTO images (mime_type, byte_data, width, height, byte_size) VALUES (
        ${mimeType},
        ${buffer},
        ${width},
        ${height},
        ${buffer.length}
    ) RETURNING id`;

    const imageID = result[0].id;
    await db`UPDATE movies SET poster_image_id = ${imageID} WHERE id = ${movieId}`

    //Delete old poster
    if (poster.length > 0 ) {
        await db`DELETE FROM images WHERE id = ${poster[0].poster_image_id}`;
    }
}


/*
CREATE TABLE images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mime_type TEXT NOT NULL CHECK (mime_type in ('image/jpeg', 'image/png', 'image/gif', 'image/webp')),
    byte_data BYTEA NOT NULL,
    width INT NOT NULL CHECK (width > 0),
    height INT NOT NULL CHECK (height > 0),
    byte_size INT NOT NULL CHECK (byte_size > 0)
);*/