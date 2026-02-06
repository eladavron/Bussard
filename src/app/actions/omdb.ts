'use server';

import { IMDBPattern, OMDBMovieExtended, OMDBResult } from '@/src/types/omdb';

export async function searchOMDB(query: string): Promise<OMDBResult | OMDBMovieExtended> {
    if (!query) {
        throw new Error('Query parameter is required');
    }

    const params = new URLSearchParams();
    params.append(query.match(IMDBPattern) ? 'i' : 's', query);
    params.append('apikey', process.env.OMDB_API_KEY || '');

    const response = await fetch(`http://www.omdbapi.com/?${params.toString()}`);
    if (!response.ok) {
        throw new Error(`OMDB API error: ${response.statusText}`);
    }
    return await response.json();
}
