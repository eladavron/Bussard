'use server';

import sharp from 'sharp';
import { db } from '../../lib/db';
import { DBImage } from '@/src/types/db_image';
import logger from '@/src/lib/logger';

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
        logger.error(`Failed to fetch image from URL ${url}: ${response.statusText}`);
        throw new Error('Failed to fetch image from URL');
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

async function getImageFromForm(formData: FormData): Promise<Buffer> {
    const file = formData.get('file') as File;
    if (!file || file.size === 0) {
        logger.error('No file uploaded');
        throw new Error('No file uploaded');
    }
    const arrayBuffer = await file.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

export async function addImageFromBuffer(buffer: Buffer, mime_type: string, width: number, height: number): Promise<string> {
    const newID = await db`INSERT INTO images (mime_type, byte_data, width, height, byte_size) VALUES (
        ${mime_type},
        ${buffer},
        ${width},
        ${height},
        ${buffer.length}
    ) RETURNING id`
    logger.info(`Added image with id ${newID[0].id} to the database`);
    return newID[0].id;
}

async function addImage(formData?: FormData, imageUrl?: string): Promise<string> {
    let buffer: Buffer;

    if (imageUrl) {
        buffer = await getImageFromURL(imageUrl);
    } else if (formData) {
        buffer = await getImageFromForm(formData);
    } else {
        logger.error('No image source provided');
        throw new Error('No image source provided');
    }
    logger.info(`Got image buffer of size ${buffer.length} bytes`);

    const metadata = await sharp(buffer).metadata();
    const mime_type = `image/${metadata.format}`;
    const width = metadata.width;
    const height = metadata.height;

    return await addImageFromBuffer(buffer, mime_type, width, height);
}

export async function uploadMovieImage(movieId: string, formData: FormData) {
    const imageID = await addImage(formData);
    logger.info(`Uploaded image for movie ${movieId} with image ID ${imageID}`);
    await setMoviePoster(movieId, imageID);
}

export async function addMovieImageFromURL(movieId: string, imageUrl: string) {
    //Check if movie already has a poster
    const imageID = await addImage(undefined, imageUrl);
    logger.info(`Added image for movie ${movieId} from URL ${imageUrl} with image ID ${imageID}`);
    await setMoviePoster(movieId, imageID);
}

export async function setMoviePoster(movieId: string, imageId: string) {
    //Check if movie already has a poster
    const old_poster = await db`SELECT poster_image_id FROM movies WHERE id = ${movieId}`;

    await db`UPDATE movies SET poster_image_id = ${imageId} WHERE id = ${movieId}`

    //Delete old poster
    if (old_poster.length > 0) {
        logger.warn(`Deleting old poster for movie ${movieId} with image ID ${old_poster[0].poster_image_id}`);
        await db`DELETE FROM images WHERE id = ${old_poster[0].poster_image_id}`;
    }
}

export async function deleteImage(movieId: string) {
    const image = await db<{ id: string }[]>`SELECT poster_image_id AS id FROM movies WHERE id = ${movieId} LIMIT 1`;
    if (image.length === 0) {
        logger.error(`No image found for movie ${movieId}`);
        throw new Error('No image found for this movie');
    }
    const imageId = image[0].id;
    await db`UPDATE movies SET poster_image_id = NULL WHERE id = ${movieId}`;
    logger.info(`Deleted image for movie ${movieId} with image ID ${imageId}`);
    return await db`DELETE FROM images WHERE id = ${imageId}`;
}
