'use client';

import MoviePoster from '../components/MoviePoster'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { IoIosAddCircleOutline } from "react-icons/io";
import { useState, useEffect } from 'react';
import UploadModal from '../components/UploadModal';
import { exportMetadataToFile, importMetadataFromFile } from './metadata/actions';
import { Movie } from '../types/movie';

export default function Home() {
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
    fetch('/api/movies')
      .then(res => res.json())
      .then(data => setMovies(data.movies))
      .catch(() => setMovies([]));
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="main-header">
          <div className="flex flex-col gap-2 items-start">
            <h1 className="">My Collection</h1>
            <span className="tag tag-blue">
              {movies.length} Movies
            </span>
          </div>
          <span>
            <Menu as="div" className="relative inline-block">
              <MenuButton className="button-hollow flex items-center gap-1">
                Options
              </MenuButton>

              <MenuItems transition className="menu-dropdown">
                <MenuItem>
                  <a href="#" className="menu-item-link" onClick={() => setUploadModalOpen(true)}>
                    Import...
                  </a>
                </MenuItem>
                                <MenuItem>
                  <a href="#" className="menu-item-link" onClick={() => exportMetadataToFile().then((blob) => {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'backup_metadata.json';
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    URL.revokeObjectURL(url);
                  })}>
                    Export...
                  </a>
                </MenuItem>
              </MenuItems>
            </Menu>
          </span>
        </header>

        <div className="main-grid">
          {movies.map((movie) => (
            <article key={movie.id} className="movie-card">
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-semibold text-gray-900 leading-tight">
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
                  <p><strong className="text-primary">Starring:</strong> {movie.actors.slice(0, 3).map(a => a.name).join(', ')}{movie.actors.length > 3 ? '...' : ''}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
        <UploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          onUpload={async (formData) => {
            importMetadataFromFile(formData);
            setUploadModalOpen(false);
          }}
          title="Import Movie Metadata"
          message="Select a metadata JSON file to import movie data."
        />
      </div>
    </main>
  );
}
