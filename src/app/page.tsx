'use client';

import { useState, useEffect } from 'react';
import { Movie } from '../types/movie';
import { getMovies } from './actions/movies';
import MovieCard from '../components/movie-card/MovieCard';
import TopBar from '../components/TopBar';
import MovieCardSkeleton from '../components/movie-card/MovieCardSkeleton';

export default function Home() {
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterQuery, setFilterQuery] = useState<string>('');

  const refreshMovies = async () => {
    setLoading(true);
    const data = await getMovies();
    setAllMovies(data);
    setFilteredMovies(data);
    setLoading(false);
  };

  useEffect(() => {
    refreshMovies();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => clearTimeout(timer);
  }, [filterQuery]);

  function handleSearch() {
    setFilteredMovies(allMovies.filter((movie) =>
      movie.title.toLowerCase().includes(filterQuery.toLowerCase())
      || movie.description?.toLowerCase().includes(filterQuery.toLowerCase())
      || movie.actors.some(actor => actor.name.toLowerCase().includes(filterQuery.toLowerCase()))
      || movie.directors.some(director => director.name.toLowerCase().includes(filterQuery.toLowerCase()))
      || (movie.year && movie.year.toString().includes(filterQuery)),
    ));
  }

  return (
    <>
      <TopBar movies={allMovies} refreshMovies={refreshMovies} setFilterQuery={setFilterQuery} filterQuery={filterQuery} loading={loading} />

      <div className="main-grid">
        {loading && [1, 2, 3, 4].map((i) => <MovieCardSkeleton key={i} />)}
        {allMovies && allMovies.length === 0 && !loading && (
          <div className="empty-state">
            <h2 className="text-2xl font-semibold mb-2">No movies found</h2>
            <p className="text-secondary">Start by adding some movies to your collection.</p>
          </div>
        )}
        {filteredMovies && filteredMovies.length > 0 && !loading && (
          filteredMovies
            .sort((a, b) => a.title.localeCompare(b.title)) //TODO: Custom Sorting (ignoring articles, etc.)
            .map((movie) => <MovieCard key={movie.id} movie={movie} onRefresh={refreshMovies} />)
        )}
      </div>
    </>
  );
}
