'use client';

import { useState } from 'react';
import BaseModal from './BaseModal';
import { IMDBPattern, OMDBMovie, OMDBResult } from '../types/omdb';

interface AddModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}


// Add logic for searching by title if needed
export default function AddModal({ isOpen, setIsOpen }: AddModalProps) {

    const [omdbResults, setOmdbResults] = useState<OMDBMovie[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');

    async function search(): Promise<void> {
        const results = await fetch("/api/search-omdb?query=" + encodeURIComponent(searchQuery))
        if (!results.ok) {
            setOmdbResults([]);
            return;
        }
        const data = await results.json() as OMDBResult;
        setOmdbResults(data.Search);
    }

    return (
        <BaseModal
            title="Add New Movie..." isOpen={isOpen} onClose={() => setIsOpen(false)}
            fullWidth={true}
            body={<>
                <div className="flex justify-center">
                    <div className='w-1/2'>
                        <div className='text-primary'>Search by IMDB ID or Title...</div>
                        <input
                            className='input-default w-full'
                            name='search'
                            placeholder='tt1234567 or "Interstellar"...'
                            value={searchQuery}
                            onChange={(e) => {setSearchQuery(e.target.value); search();}}
                        />
                    </div>
                </div>
                {searchQuery && <div>
                    {omdbResults && omdbResults.length > 0 ? (
                        <ul>
                            {omdbResults.map((movie) => (
                                <li key={movie.imdbID} className="mb-4 p-2 border border-gray-300 rounded">
                                    <div className="flex items-center">
                                        {movie.Poster !== 'N/A' ? (
                                            <img src={movie.Poster} alt={`${movie.Title} Poster`} className="w-16 h-auto mr-4" />
                                        ) : (
                                            <div className="w-16 h-24 bg-gray-200 flex items-center justify-center mr-4">
                                                <span className="text-gray-500 text-sm">No Image</span>
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="text-lg font-semibold">{movie.Title}</h3>
                                            <p className="text-sm text-secondary">{movie.Year} - {movie.Type}</p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-primary">No results found.</p>
                    )}
                </div>}
            </>
            }
        />
    );
}
