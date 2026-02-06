'use server';

import { db } from "@/src/lib/db";

export async function addDisk(movieId: string, format: string, region: string | null) {
    let disk_id = await db`
        INSERT INTO movie_disks (movie_id, disk_region, disk_format)
        VALUES (
            ${movieId},
            ${region ? db`(SELECT id FROM regions WHERE name = ${region})` : null},
            (SELECT id FROM formats WHERE name = ${format})
        ) RETURNING id;
    `;
}

export async function removeDisk(movieId: string, format: string, region: string | null) {
    if (region === null) {
        await db`
            DELETE FROM movie_disks
            WHERE movie_id = ${movieId}
            AND disk_format = (SELECT id FROM formats WHERE name = ${format})
            AND disk_region IS NULL
        `;
    } else {
        await db`
            DELETE FROM movie_disks
            WHERE movie_id = ${movieId}
            AND disk_format = (SELECT id FROM formats WHERE name = ${format})
            AND disk_region = (SELECT id FROM regions WHERE name = ${region})
        `;
    }
}