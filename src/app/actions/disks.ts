'use server';

import { db } from '@/src/lib/db';
import logger from '@/src/lib/logger';

export async function addDisk(movieId: string, format: string, regions: string[] | null): Promise<string> {
    logger.info(`Adding disk for movie ${movieId} with format ${format} and regions ${regions}`);
    const disk_id = await db`
        INSERT INTO movie_disks (movie_id, disk_format)
        VALUES (
            ${movieId},
            (SELECT id FROM formats WHERE name = ${format})
        ) RETURNING id;
    `;
    logger.info(`Added disk with id ${disk_id[0].id} for movie ${movieId}`);
    logger.info(`Adding regions for disk ${disk_id[0].id}`);
    for (const region of regions || []) {
        await db`
            INSERT INTO movie_disk_regions (movie_disk_id, region_id)
            VALUES (
                ${disk_id[0].id},
                (SELECT id FROM regions WHERE name = ${region})
            );
        `;
    }
    return disk_id[0].id;
}

export async function removeDisk(disk_id: string): Promise<void> {
    logger.info(`Removing disk with id ${disk_id}`);
    await db`
        DELETE FROM movie_disks
        WHERE id = ${disk_id}
    `;
    await db`
        DELETE FROM movie_disk_regions
        WHERE movie_disk_id = ${disk_id}
    `;
    logger.info(`Removed disk with id ${disk_id}`);
}