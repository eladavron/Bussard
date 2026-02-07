'use server';

import ExifReader from 'exifreader';
import { db } from '../../lib/db';
import { DBImage } from '@/src/types/db_image';

export type MoviePosterMeta = {
    src: string;
    isPlaceholder: boolean;
    width: number;
    height: number;
}

export async function getMoviePoster(movieId: string): Promise<MoviePosterMeta> {
    const image = await db<DBImage[]>`SELECT * FROM images WHERE id IN (SELECT poster_image_id FROM movies WHERE id = ${movieId}) LIMIT 1`;

    const width = 200;
    let height = 300;
    let src = '/movie_poster.jpg';
    let isPlaceholder = true;

    if (image.length > 0) {
        const img = image[0];
        height = Math.floor((img.height / img.width) * width);
        const base64String = Buffer.from(img.byte_data).toString('base64');
        src = `data:${img.mime_type};base64,${base64String}`;
        isPlaceholder = false;
    }

    return { src, isPlaceholder, width, height };
}

export type ImageInput = {
    mime_type: string;
    byte_data: Buffer;
    width?: number;
    height?: number;
    byte_size: number;
}

async function getImageFromURL(url: string): Promise<Buffer> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Failed to fetch image from URL');
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

async function getImageFromForm(formData: FormData): Promise<Buffer> {
    const file = formData.get('image') as File;
    if (!file || file.size === 0) {
        throw new Error('No file uploaded');
    }
    const arrayBuffer = await file.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

async function addImage(formData?: FormData, imageUrl?: string): Promise<string> {
    let buffer: Buffer;

    if (imageUrl) {
        buffer = await getImageFromURL(imageUrl);
    } else if (formData) {
        buffer = await getImageFromForm(formData);
    } else {
        throw new Error('No image source provided');
    }

    const tags = ExifReader.load(buffer);

    const width = Number(tags['Image Width']?.value ?? tags.ImageWidth?.value ?? 0);
    const height = Number(tags['Image Height']?.value ?? tags.ImageHeight?.value ?? 0);
    const mime_type = `image/${tags.FileType?.value || 'UNKNOWN'}`;

    const newItem = await db`INSERT INTO images (mime_type, byte_data, width, height, byte_size) VALUES (
        ${mime_type},
        ${buffer},
        ${width},
        ${height},
        ${buffer.length}
    ) RETURNING id`;
    return newItem[0].id;
}

export async function uploadMovieImage(movieId: string, formData: FormData) {
    //Check if movie already has a poster
    const old_poster = await db`SELECT poster_image_id FROM movies WHERE id = ${movieId}`;

    const imageID = await addImage(formData);
    await db`UPDATE movies SET poster_image_id = ${imageID} WHERE id = ${movieId}`

    //Delete old poster
    if (old_poster.length > 0) {
        await db`DELETE FROM images WHERE id = ${old_poster[0].poster_image_id}`;
    }
}

export async function addMovieImageFromURL(movieId: string, imageUrl: string) {
    //Check if movie already has a poster
    const old_poster = await db`SELECT poster_image_id FROM movies WHERE id = ${movieId}`;

    const imageID = await addImage(undefined, imageUrl);
    await db`UPDATE movies SET poster_image_id = ${imageID} WHERE id = ${movieId}`
    //Delete old poster
    if (old_poster.length > 0) {
        await db`DELETE FROM images WHERE id = ${old_poster[0].poster_image_id}`;
    }
}

export async function deleteImage(movieId: string) {
    const image = await db<{ id: string }[]>`SELECT poster_image_id AS id FROM movies WHERE id = ${movieId} LIMIT 1`;
    if (image.length === 0) {
        throw new Error('No image found for this movie');
    }
    const imageId = image[0].id;
    await db`UPDATE movies SET poster_image_id = NULL WHERE id = ${movieId}`;
    return await db`DELETE FROM images WHERE id = ${imageId}`;
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