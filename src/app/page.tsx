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
  const [loading, setLoading] = useState<boolean>(true);
  const [filterQuery, setFilterQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<SortOption>({
    sortBy: SortBy.TITLE,
    sortOrder: SortOrder.ASC,
    ignoreArticles: true,
  });

  const seenLetters = new Set<string>();

  const refreshMovies = async () => {
    const data = await getMovies();
    setAllMovies(data);
    setFilteredMovies(data);
    setLoading(false);
  };

  useEffect(() => {
    refreshMovies();
  }, []);

  useEffect(() => {
    if (filterQuery === '') {
      setFilteredMovies(allMovies);
      setLoading(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(() => {
      handleSearch();
    }, 500);
    return () => clearTimeout(timer);
  }, [filterQuery, allMovies]);

  async function handleSearch() {
    setFilteredMovies(allMovies.filter((movie) =>
      movie.title.toLowerCase().includes(filterQuery.toLowerCase())
      || movie.description?.toLowerCase().includes(filterQuery.toLowerCase())
      || movie.actors.some(actor => actor.name.toLowerCase().includes(filterQuery.toLowerCase()))
      || movie.directors.some(director => director.name.toLowerCase().includes(filterQuery.toLowerCase()))
      || (movie.year && movie.year.toString().includes(filterQuery)),
    ));
    setLoading(false);
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
        loading={loading}
        seenLetters={seenLetters}
      />

      <div className="main-grid">
        {loading
          ? Array.from({length: 10}).map((_, i) => i+1).map(i => <MovieCardSkeleton key={i} />)
          : filteredMovies.length === 0
            ? (
              <div className="empty-state" key="empty-state">
                <h2 className="text-2xl font-semibold mb-2">No movies found</h2>
                <p className="text-secondary">Start by adding some movies to your collection.</p>
              </div>
            )
            : (
              sortedMovies(filteredMovies, sortOption)
                .map((movie) => {
                  const firstLetter = movie.title[0].toUpperCase();
                  const isFirst = !seenLetters.has(firstLetter);
                  if (isFirst) {
                    seenLetters.add(firstLetter);
                  }
                  return (
                    <div id={isFirst ? `letter-${firstLetter}` : undefined} key={movie.id} className='flex items-stretch'>
                      <MovieCard key={movie.id} movie={movie} onRefresh={refreshMovies} />
                    </div>
                  );
                })
            )
        }
      </div>
    </>
  );
}
