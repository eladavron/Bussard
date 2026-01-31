'use client';

import MoviePoster from '../components/MoviePoster'
import { useState, useEffect } from 'react';
import { Movie } from '../types/movie';
import { IoAddCircleOutline } from "react-icons/io5";
import { Link, Tooltip } from '@heroui/react';

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
    fetch('/api/movies')
      .then(res => res.json())
      .then(data => setMovies(data.movies))
      .catch(() => setMovies([]));
  }, []);

  return (
    <>
      <div className="flex gap-2 mb-6">
        <span className="tag tag-blue">
          {movies.length} Movies
        </span>
        <Tooltip color='foreground' content="Add Movie" placement='bottom' closeDelay={0}>
          <Link role='button' href="/new-movie" className="button-hollow tag cursor-pointer">
            <IoAddCircleOutline />
          </Link>
        </Tooltip>
      </div>

      <div className="main-grid">
          {movies.map((movie) => (
            <article key={movie.id} className="movie-card">
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="movie-title">
                    {movie.title}
                  </h2>
                  <span className="tag tag-gray font-mono p-0">
                    {movie.year}
                  </span>
                </div>
                <div className="flex justify-center pb-4">
                  <MoviePoster movieId={movie.id} />
                </div>
                <div className="text-sm text-secondary mb-4 flex gap-2">
                  <span>{movie.runtime_min} min</span>
                  <span>•</span>
                  <span>
                    {Array.from(new Set(movie.disks.map(d => d.format.name).filter(Boolean))).join(', ') || 'No Format'}
                  </span>
                </div>

                <p className="text-primary text-sm line-clamp-3 mb-4">
                  {movie.description || 'No description available.'}
                </p>

                <div className="text-xs text-secondary space-y-1">
                  <p><strong className="text-primary">Director:</strong> {movie.directors.map(d => d.name).join(', ') || 'N/A'}</p>
                  <p><strong className="text-primary">Starring:</strong> {movie.actors.slice(0, 3).map(a => a.name + "(" + (a.character || '') + ")").join(', ')}{movie.actors.length > 3 ? '...' : ''}</p>
                </div>
              </div>
            </article>
          ))}
      </div>
    </>
  );
}
