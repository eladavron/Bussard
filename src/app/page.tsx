'use client';

import { useState, useEffect } from 'react';
import { Movie } from '../types/movie';
import { IoAddCircleOutline,  IoReload } from "react-icons/io5";
import { Link, Tooltip } from '@heroui/react';
import SearchModal from '../components/modals/SearchModal';
import { getMovies } from './actions/movies';
import MovieCard from '../components/movie-card/MovieCard';

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);

  const refreshMovies = async () => {
    let data = await getMovies();
    setMovies(data);
  };

  useEffect(() => {
    refreshMovies();
  }, []);

  return (
    <>
      <div className="flex gap-2 mb-6">
        <span className="tag tag-blue">
          {movies.length} Movies
        </span>
        <Tooltip color='foreground' content='Refresh' placement='top' closeDelay={0}>
          <Link role='button' href="#" onClick={async () => {
            await refreshMovies();
          }} className="button-hollow tag cursor-pointer">
            <IoReload />
          </Link>
        </Tooltip>
        <Tooltip color='foreground' content="Add Movie" placement='top' closeDelay={0}>
          <Link role='button' href="#" onClick={() => setIsSearchModalOpen(true)} className="button-hollow tag cursor-pointer">
            <IoAddCircleOutline />
          </Link>
        </Tooltip>
      </div>

      <div className="main-grid">
          {movies.map((movie) => MovieCard(movie) )}
      </div>

      <SearchModal isOpen={isSearchModalOpen} setIsOpen={setIsSearchModalOpen} onMovieAdded={async () => {
        await refreshMovies();
        setIsSearchModalOpen(false);
      }} />
    </>
  );
}
