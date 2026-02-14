'use server';

import { db } from '@/src/lib/db';
import { serverLogger as logger } from '@/src/lib/serverLogger';

export async function clearMetadata() {
    await db`DELETE FROM people`;
    await db`DELETE FROM movies`;
    await db`DELETE FROM movie_directors`;
    await db`DELETE FROM movie_actors`;
    await db`DELETE FROM movie_writers`;
    await db`DELETE FROM movie_disks`;
    await db`DELETE FROM images`;
    await logger.debug('Cleared all metadata from the database');
};
