'use client';

import { useState, useEffect } from 'react';
import { Movie } from '../types/movie';
import { getMovies } from './actions/movies';
import MovieCard from '../components/movie-card/MovieCard';
import TopBar from '../components/TopBar';
import MovieCardSkeleton from '../components/movie-card/MovieCardSkeleton';

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshMovies = async () => {
    setLoading(true);
    const data = await getMovies();
    setMovies(data);
    setLoading(false);
  };

  useEffect(() => {
    refreshMovies();
  }, []);

  return (
    <>
      <TopBar movies={movies} refreshMovies={refreshMovies} loading={loading} />

      <div className="main-grid">
        {loading && [1, 2, 3, 4].map((i) => <MovieCardSkeleton key={i} />)}
        {movies && movies.length === 0 && !loading && (
          <div className="empty-state">
            <h2 className="text-2xl font-semibold mb-2">No movies found</h2>
            <p className="text-secondary">Start by adding some movies to your collection.</p>
          </div>
        )}
        {movies && movies.length > 0 && !loading && (
          movies.map((movie) => <MovieCard key={movie.id} movie={movie} onRefresh={refreshMovies} />)
        )}
      </div>
    </>
  );
}
