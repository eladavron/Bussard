'use client';

import { getMovies } from '../app/actions/movies';
import { Movie } from '../types/movie';

export async function refreshMovies(setMovies: (movies: Movie[]) => void) {
     const data = await getMovies();
    setMovies(data);
};