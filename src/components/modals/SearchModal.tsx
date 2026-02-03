'use client';

import { useState, useEffect, useRef } from 'react';
import BaseModal from './BaseModal';
import { OMDBMovieExtended, OMDBResult } from '../../types/omdb';
import MovieResultRow from './MovieResultRow';

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
    const movieIDsBeingFetched = useRef<Set<string>>(new Set());

    // Debounce timer reference
    useEffect(() => {
        const timer = setTimeout(() => {
            search(searchQuery);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        omdbResults?.forEach((movie) => {
            void getMoreData(movie.imdbID);
        });
    }, [omdbResults]);

    useEffect(() => {
        if (!isOpen) {
            setOmdbResults([]);
            setSearchQuery('');
            setErrorMessage(['', '']);
        }
    }, [isOpen]);

    async function getMoreData(imdbID: string): Promise<void> {
        if (movieIDsBeingFetched.current.has(imdbID)) {
            return;
        }
        movieIDsBeingFetched.current.add(imdbID);
        const results = await fetch("/api/search-omdb?query=" + encodeURIComponent(imdbID))
        if (!results.ok) {
            setErrorMessage([results.statusText, await results.text()]);
            movieIDsBeingFetched.current.delete(imdbID);
            return;
        }
        const data = await results.json() as OMDBMovieExtended;
        setOmdbResults((prev) => prev.map((movie) => (
            movie.imdbID === imdbID ? { ...movie, Actors: data.Actors, Director: data.Director } : movie
        )));
        movieIDsBeingFetched.current.delete(imdbID);
    }

    async function search(query: string): Promise<void> {
        //Only search if query is at least 3 characters
        if (query.length < 3) {
            setOmdbResults([]);
            setErrorMessage(['', '']);
            return;
        }

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
            title="Search by IMDB ID or Title..." isOpen={isOpen} onClose={() => setIsOpen(false)}
            className='max-w-1/2'
            body={<>
                <div className="flex justify-center">
                    <div className='w-full mb-0'>
                        <input
                            className='input-default w-full'
                            name='search'
                            placeholder='tt1234567 or "Interstellar"...'
                            autoComplete="off"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                            }}
                        />
                    </div>
                </div>
                {errorMessage && <div className="text-danger">{errorMessage[0]}<br /><pre>{errorMessage[1]}</pre></div>}
                {loading && (
                    <ul>
                        <MovieResultRow key="skeleton1" isLoading={true} />
                        <MovieResultRow key="skeleton2" isLoading={true} />
                        <MovieResultRow key="skeleton3" isLoading={true} />
                    </ul>
                )}
                {!loading && !errorMessage[0] && searchQuery && <div>
                    {omdbResults && omdbResults.length > 0 ? (
                        <ul>
                            {omdbResults.map((movie) => (
                                <MovieResultRow key={movie.imdbID} movie={movie} />
                            ))}
                        </ul>
                    ) : (!loading && <p className="text-primary">No results found.</p>)
                    }
                </div>}
            </>
            }
        />
    );
}

