'use client';

import { useState, useEffect } from 'react';
import { Movie } from '../types/movie';
import { getMovies } from './actions/movies';
import MovieCard from '../components/movie-card/MovieCard';
import TopBar from '../components/TopBar';

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);

  const refreshMovies = async () => {
    const data = await getMovies();
    setMovies(data);
  };

  useEffect(() => {
    refreshMovies();
  }, []);

  return (
    <>
      <TopBar movies={movies} refreshMovies={refreshMovies} />

      <div className="main-grid">
          {movies.map((movie) => <MovieCard key={movie.id} movie={movie} onRefresh={refreshMovies} />)}
      </div>


    </>
  );
}
