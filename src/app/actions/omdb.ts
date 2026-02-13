'use server';

import { IMDBPattern, OMDBMovieExtended, OMDBResult } from '@/src/types/omdb';

export async function searchOMDB(query: string): Promise<OMDBResult | OMDBMovieExtended> {
    if (!query) {
        throw new Error('Query parameter is required');
    }

    if (IMDBPattern.test(query)) {
        return await searchOMDBByParameter({ imdbID: query });
    }

    const params = new URLSearchParams();
    params.append('s', query);
    params.append('apikey', process.env.OMDB_API_KEY || '');

    const response = await fetch(`http://www.omdbapi.com/?${params.toString()}`);
    if (!response.ok) {
        throw new Error(`OMDB API error: ${response.statusText}`);
    }
    return await response.json();
}


interface searchParameters {
    title?: string;
    imdbID?: string;
    year?: number;
}

export async function searchOMDBByParameter(params: searchParameters): Promise<OMDBResult | OMDBMovieExtended> {
    const urlParams = new URLSearchParams();
    if (params.title) {
        urlParams.append('t', params.title);
    }
    if (params.imdbID) {
        urlParams.append('i', params.imdbID);
    }
    if (params.year) {
        urlParams.append('y', params.year.toString());
    }
    urlParams.append('apikey', process.env.OMDB_API_KEY || '');

    const response = await fetch(`http://www.omdbapi.com/?${urlParams.toString()}`);
    if (!response.ok) {
        throw new Error(`OMDB API error: ${response.statusText}`);
    }
    return await response.json();
}


export async function searchByBarcode(barcode: string): Promise<OMDBMovieExtended> {
    if (!barcode) {
        throw new Error('Barcode parameter is required');
    }
    const params = new URLSearchParams();
    params.append("key", process.env.BARCODE_LOOKUP_API_KEY || '');
    params.append("barcode", barcode);
    const response = await fetch(`https://api.barcodelookup.com/v3/products?${params.toString()}`);
    if (!response.ok) {
        throw new Error(`Barcode Lookup API error: ${response.statusText}`);
    }
    const data = await response.json();
    if (!data.products || data.products.length === 0) {
        throw new Error('No product found for the given barcode');
    }
    const product = data.products[0];
    if (!product.title) {
        throw new Error('Product does not have a title');
    }

    if (product.release_date) {
        const releaseYear = new Date(product.release_date).getFullYear();
        const omdbData = await searchOMDBByParameter({ title: product.title, year: releaseYear });
        if ('Search' in omdbData) {
            throw new Error('No exact match found for the given product');
        }
        return omdbData as OMDBMovieExtended;
    }

    return await searchOMDBByParameter({ title: product.title }) as OMDBMovieExtended;
}