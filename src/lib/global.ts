'use client';

import { getMovies } from '../app/actions/movies';
import { Movie } from '../types/movie';

export async function refreshMovies(setMovies: (movies: Movie[]) => void) {
    const data = await getMovies();
    setMovies(data);
};

export async function downloadData(data: object, name: string) {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}