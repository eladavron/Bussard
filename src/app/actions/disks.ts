'use server';

import { db } from "@/src/lib/db";

export async function addDisk(movieId: string, format: string, region: string) {
    let disk_id = await db`
        INSERT INTO movie_disks (movie_id, disk_region, disk_format)
        VALUES (
            ${movieId},
            (SELECT id FROM regions WHERE name = ${region}),
            (SELECT id FROM formats WHERE name = ${format})
        ) RETURNING id;
    `;
    console.log("Added disk with ID:", disk_id[0].id);
}