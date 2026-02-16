'use server';

import { serverLogger as logger } from '@/src/lib/serverLogger';
import { IMDBPattern, OMDBMovieExtended, OMDBResult } from '@/src/types/omdb';

export async function searchOMDB(query: string): Promise<OMDBResult | OMDBMovieExtended> {
    if (!query) {
        const error = new Error('Query parameter is required');
        logger.error(error.message);
        throw error;
    }

    if (IMDBPattern.test(query)) {
        logger.info(`Query "${query}" matches IMDB ID pattern, searching by IMDB ID`);
        return await searchOMDBByParameter({ imdbID: query });
    }
    logger.info(`Searching OMDB for query "${query}"`);
    const params = new URLSearchParams();
    params.append('s', query);
    params.append('apikey', process.env.OMDB_API_KEY || '');

    const response = await fetch(`http://www.omdbapi.com/?${params.toString()}`);
    if (!response.ok) {
        const error = new Error(`OMDB API error: ${response.statusText}`);
        logger.error(error.message);
        throw error;
    }
    const data = await response.json();
    logger.info(`OMDB search for query "${query}" returned ${data.Search ? data.Search.length : 0} results`);
    return data;
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
    logger.info(`Searching OMDB with parameters: ${JSON.stringify(params)}`);
    urlParams.append('apikey', process.env.OMDB_API_KEY || '');

    const response = await fetch(`http://www.omdbapi.com/?${urlParams.toString()}`);
    if (!response.ok) {
        const error = new Error(`OMDB API error: ${response.statusText}`);
        logger.error(error.message);
        throw error;
    }
    const data = await response.json();
    logger.info(`OMDB search by parameters returned ${'Search' in data ? data.Search.length : 1} results`);
    return data;
}


export async function searchByBarcode(barcode: string): Promise<OMDBMovieExtended | Error> {
    if (!barcode) {
        const error = new Error('Barcode parameter is required');
        logger.error(error.message);
        return error;
    }
    logger.info(`Searching for product with barcode "${barcode}" using Barcode Lookup API`);
    const params = new URLSearchParams();
    params.append('key', process.env.BARCODE_LOOKUP_API_KEY || '');
    params.append('barcode', barcode);
    const response = await fetch(`https://api.barcodelookup.com/v3/products?${params.toString()}`);
    if (!response.ok) {
        const error = new Error(`Barcode Lookup API error: ${response.statusText}`);
        logger.error(error.message);
        return error;
    }
    const data = await response.json();
    if (!data.products || data.products.length === 0) {
        const error = new Error('No product found for the given barcode');
        logger.error(error.message);
        return error;
    }
    const product = data.products[0];
    if (!product.title) {
        const error = new Error('Product does not have a title');
        logger.error(error.message);
        return error;
    }

    if (product.release_date) {
        const releaseYear = new Date(product.release_date).getFullYear();
        const omdbData = await searchOMDBByParameter({ title: product.title, year: releaseYear });
        if ('Search' in omdbData) {
            const error = new Error('No exact match found for the given product');
            logger.error(error.message);
            return error;
        }
        return omdbData as OMDBMovieExtended;
    }

    logger.info(`No release date found for product "${product.title}", searching OMDB by title only`);
    return await searchOMDBByParameter({ title: product.title }) as OMDBMovieExtended;
}