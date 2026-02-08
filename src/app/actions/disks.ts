'use server';

import { db } from '@/src/lib/db';

export async function addDisk(movieId: string, format: string, regions: string[] | null): Promise<string> {
    const disk_id = await db`
        INSERT INTO movie_disks (movie_id, disk_format)
        VALUES (
            ${movieId},
            (SELECT id FROM formats WHERE name = ${format})
        ) RETURNING id;
    `;
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

export async function removeDisk(movieId: string, format: string): Promise<void> {
    await db`
        DELETE FROM movie_disks
        WHERE movie_id = ${movieId}
        AND disk_format = (SELECT id FROM formats WHERE name = ${format});
    `;
    await db`
        DELETE FROM movie_disk_regions
        WHERE movie_disk_id IN (
            SELECT id FROM movie_disks
            WHERE movie_id = ${movieId}
            AND disk_format = (SELECT id FROM formats WHERE name = ${format})
        );
    `;
}