'use server';

import { db } from '@/src/lib/db';
import logger from '@/src/lib/logger';

export async function clearMetadata() {
    await db`DELETE FROM people`;
    await db`DELETE FROM movies`;
    await db`DELETE FROM movie_directors`;
    await db`DELETE FROM movie_actors`;
    await db`DELETE FROM movie_writers`;
    await db`DELETE FROM movie_disks`;
    await db`DELETE FROM images`;
    logger.debug('Cleared all metadata from the database');
};
