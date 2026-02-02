'use server';

import { db } from "@/src/lib/db";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    await db`DELETE FROM people`;
    await db`DELETE FROM movies`;
    await db`DELETE FROM movie_directors`;
    await db`DELETE FROM movie_actors`;
    await db`DELETE FROM movie_writers`;
    await db`DELETE FROM movie_disks`;
    await db`DELETE FROM images`;

    return new Response('Database cleared', { status: 200 });
}
