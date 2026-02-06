'use client';

import { getMovies } from "../app/actions/movies";

export async function refreshMovies(setMovies: (movies: any) => void) {
     let data = await getMovies();
    setMovies(data);
};