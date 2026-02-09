'use client';

import { useState, useEffect } from 'react';
import { Movie } from '../types/movie';
import { getMovies } from './actions/movies';
import MovieCard from '../components/movie-card/MovieCard';
import TopBar from '../components/TopBar';
import MovieCardSkeleton from '../components/movie-card/MovieCardSkeleton';
import { SortBy, sortMovies as sortedMovies, SortOption, SortOrder } from '../lib/sorting';

export default function Home() {
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [initialLoad, setInitialLoad] = useState<boolean>(true);
  const [filterQuery, setFilterQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<SortOption>({
    sortBy: SortBy.TITLE,
    sortOrder: SortOrder.ASC,
    ignoreArticles: true,
  });

  const refreshMovies = async () => {
    const data = await getMovies();
    setAllMovies(data);
    setFilteredMovies(data);
    setInitialLoad(false);
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
      <TopBar 
        movies={allMovies}
        refreshMovies={refreshMovies}
        setFilterQuery={setFilterQuery}
        filterQuery={filterQuery}
        sortOption={sortOption}
        setSortOption={setSortOption}
        loading={initialLoad} 
      />

      <div className="main-grid">
        {initialLoad && [1, 2, 3, 4].map((i) => <MovieCardSkeleton key={i} />)}
        {allMovies && allMovies.length === 0 && !initialLoad && (
          <div className="empty-state">
            <h2 className="text-2xl font-semibold mb-2">No movies found</h2>
            <p className="text-secondary">Start by adding some movies to your collection.</p>
          </div>
        )}
        {filteredMovies && filteredMovies.length > 0 && !initialLoad && (
          sortedMovies(filteredMovies, sortOption)
            .map((movie) => <MovieCard key={movie.id} movie={movie} onRefresh={refreshMovies} />)
        )}
      </div>
    </>
  );
}
