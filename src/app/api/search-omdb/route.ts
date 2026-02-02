'use server';

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const query = request.nextUrl.searchParams.get('query');
    if (!query) {
        return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const params = new URLSearchParams();
    params.append('s', query);
    params.append('apikey', process.env.OMDB_API_KEY || '');

    try {
        const response = await fetch(`http://www.omdbapi.com/?${params.toString()}`);
        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch from OMDB API' }, { status: 502 });
        }
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}