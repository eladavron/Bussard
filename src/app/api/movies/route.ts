import { db } from '@/src/lib/db';
import { Movie } from '@/src/types/movie';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {

    //TODO: Add filtering and sorting options

    try {
        const movies = await db<Movie[]>`SELECT * FROM movie_overview ORDER BY title ASC`;

        return NextResponse.json({ movies });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch movies' }, { status: 500 });
    }
}