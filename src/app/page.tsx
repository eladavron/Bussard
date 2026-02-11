'use client';

import React, { useState, useEffect } from 'react';
import { Movie } from '../types/movie';
import { getMovies } from './actions/movies';
import MovieCard from '../components/movie-card/MovieCard';
import TopBar from '../components/top-bar/TopBar';
import MovieCardSkeleton from '../components/movie-card/MovieCardSkeleton';
import { SortBy, sortMovies as sortedMovies, sortedName, SortOption, SortOrder } from '../lib/sorting';
import { BiSolidToTop } from 'react-icons/bi';
import Header from '../components/Header';
import { Alert, Code, Link, SharedSelection, Skeleton, Textarea, Tooltip } from '@heroui/react';

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
  const [filterOptions, setFilterOptions] = useState<SharedSelection>(new Set());

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
    setLoading(true);
    const timer = setTimeout(() => {
      handleSearch();
    }, 500);
    return () => clearTimeout(timer);
  }, [filterQuery, Array.from(filterOptions).join(','), allMovies]);

  async function handleSearch() {
    setFilteredMovies(allMovies.filter((movie) => {
      const hasFormat = (filterOptions as Set<string>).has(movie.disks?.[0]?.format.name || '');
      const hasRegion = movie.disks?.some(disk => disk.regions?.some(r => (filterOptions as Set<string>).has(r.name)));
      const noDisks = (filterOptions as Set<string>).has('no-disks') && (!movie.disks || movie.disks.length === 0);
      const matchesText = filterQuery === ''
        ? true
        : movie.title.toLowerCase().includes(filterQuery.toLowerCase())
        || movie.description?.toLowerCase().includes(filterQuery.toLowerCase())
        || movie.actors.some(actor => actor.name.toLowerCase().includes(filterQuery.toLowerCase()))
        || movie.directors.some(director => director.name.toLowerCase().includes(filterQuery.toLowerCase()))
        || (movie.year && movie.year.toString().includes(filterQuery));
      // If no filterOptions are selected, show all movies (matchesText only)
      const hasAnyFilter = (filterOptions as Set<string>).size > 0;
      return hasAnyFilter
        ? (hasFormat || hasRegion || noDisks) && matchesText
        : matchesText;
    }));
    setLoading(false);
  }

  return (
    <>
      <div id="top" />
      <Header refreshMovies={refreshMovies} />
      <TopBar
        movies={allMovies}
        refreshMovies={refreshMovies}
        setFilterQuery={setFilterQuery}
        filterQuery={filterQuery}
        sortOption={sortOption}
        setSortOption={setSortOption}
        loading={loading}
        seenLetters={seenLetters}
        filterOptions={filterOptions}
        setFilterOptions={setFilterOptions}
        filteredMovieCount={filteredMovies.length}
      />
      <div className="main-grid">
        {loading && (
          <>
            <div className="col-span-full mt-6 mb-2">
              <h2>
                <span className='text-xl font-bold'><Skeleton className="w-5 h-6 mb-1" /></span>
              </h2>
              <Skeleton className="w-full h-0.5" />
            </div>
            <MovieCardSkeleton />
            <MovieCardSkeleton />
            <div className="col-span-full mt-6 mb-2">
              <h2>
                <span className='text-xl font-bold'><Skeleton className="w-5 h-6 mb-1" /></span>
              </h2>
              <Skeleton className="w-full h-0.5" />
            </div>
            <MovieCardSkeleton />
            <MovieCardSkeleton />
            <MovieCardSkeleton />
          </>
        )
        }
        {filteredMovies.length === 0 && !loading && (
          <div className="empty-state">
            <h2 className="text-2xl font-semibold mb-2">No movies found</h2>
            <p className="text-secondary">Start by adding some movies to your collection.</p>
          </div>
        )}
        {!loading && filteredMovies.length > 0 && (
          sortedMovies(filteredMovies, sortOption).map((movie) => {
            const firstLetter = sortedName(movie, sortOption.ignoreArticles)[0].toUpperCase();
            const isFirst = !seenLetters.has(firstLetter);
            if (isFirst) {
              seenLetters.add(firstLetter);
            }
            return (
              <React.Fragment key={movie.id}>
                {isFirst && <div key={`header-${firstLetter}`} className="col-span-full mt-6 mb-2">
                  <h2 className="border-b-1 border-gray-500 flex justify-between" id={`letter-${firstLetter}`}>
                    <span className='text-xl font-bold'>{firstLetter}</span>
                    <Tooltip color='foreground' content={'Back to top'} placement='top' closeDelay={0}>
                      <Link onClick={() => document.getElementById('top')?.scrollIntoView({ behavior: 'smooth' })}
                        className="flex items-center cursor-pointer text-xl text-secondary"><BiSolidToTop /></Link>
                    </Tooltip>
                  </h2>
                </div>}
                <div key={movie.id} className='flex items-stretch'>
                  <MovieCard key={movie.id} movie={movie} onRefresh={refreshMovies} />
                </div>
              </React.Fragment>
            );
          })
        )
        }
      </div >
      {process.env.NODE_ENV === 'development' &&
        <div className="flex flex-col gap-2 mt-6">
          <Alert color='warning'>DEBUG DATA!</Alert>

          <Code className='text-primary p-3'>
            <pre>
              {JSON.stringify({
                filterQuery,
                filterOptions: Array.from(filterOptions),
                sortOption,
                filteredMoviesCount: filteredMovies.length,
              }, null, 2)}
            </pre>
          </Code>
        </div>
      }
    </>
  );
}