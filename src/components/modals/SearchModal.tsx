'use client';

import { useState } from 'react';
import BaseModal from './BaseModal';
import { OMDBMovieExtended, OMDBResult } from '../../types/omdb';
import { Skeleton } from '@heroui/react';

interface SearchModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

// Add logic for searching by title if needed
export default function SearchModal({ isOpen, setIsOpen }: SearchModalProps) {

    const [omdbResults, setOmdbResults] = useState<OMDBMovieExtended[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<[string, string]>(['', '']);

    async function getMoreData(imdbID: string): Promise<void> {
        setLoading(true);
        const results = await fetch("/api/search-omdb?query=" + encodeURIComponent(imdbID))
        if (!results.ok) {
            setLoading(false);
            setErrorMessage([results.statusText, await results.text()]);
            return;
        }
        const data = await results.json() as OMDBMovieExtended;
        omdbResults.filter(m => m.imdbID === imdbID)[0].Actors = data.Actors;
        setOmdbResults([...omdbResults]);
        setLoading(false);
    }

    async function search(query: string): Promise<void> {
        setLoading(true);
        const results = await fetch("/api/search-omdb?query=" + encodeURIComponent(query))
        if (!results.ok) {
            setOmdbResults([]);
            setLoading(false);
            setErrorMessage([results.statusText, await results.text()]);
            return;
        }
        const data = await results.json() as OMDBResult;
        setErrorMessage(['', '']);
        setOmdbResults(data.Search);
        setLoading(false);
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
                            onChange={(e) => {
                                const newValue = e.target.value;
                                setSearchQuery(newValue);
                                search(newValue);
                            }}
                        />
                    </div>
                </div>
                {loading && <p className="text-primary">Loading...</p>}
                {errorMessage && <div className="text-danger">{errorMessage[0]}<br /><pre>{errorMessage[1]}</pre></div>}
                {!errorMessage[0] && searchQuery && <div>
                    {omdbResults && omdbResults.length > 0 ? (
                        <ul>
                            {omdbResults.map((movie) => (
                                <li key={movie.imdbID} className="mb-4 p-2 border border-gray-300 rounded">
                                    <div className="flex">
                                        {movie.Poster !== 'N/A' ? (
                                            <img src={movie.Poster} alt={`${movie.Title} Poster`} className="w-16 h-auto mr-4" />
                                        ) : (
                                            <div className="w-16 h-24 bg-gray-200 flex items-center justify-center mr-4">
                                                <span className="text-gray-500 text-sm">No Image</span>
                                            </div>
                                        )}
                                        <div className="grow">
                                            <div className='flex items-start justify-between'>
                                                <h3 className="text-lg font-semibold">{movie.Title}</h3>
                                                <a href={`https://www.imdb.com/title/${movie.imdbID}`} className="text-sm text-secondary" target="_blank" rel="noopener noreferrer"><code>{movie.imdbID}</code></a>
                                            </div>
                                            <p className="text-sm text-secondary">{movie.Year}</p>
                                            {movie.Actors ?
                                                <p className="text-sm mt-2"><strong>Actors:</strong> {movie.Actors}</p>
                                                : (getMoreData(movie.imdbID),
                                                    <div className="mt-2">
                                                        <Skeleton className="h-4 w-3/4 rounded" />
                                                    </div>
                                                )
                                            }
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
