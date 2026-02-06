'use client';

import { useState, useEffect, useRef } from 'react';
import BaseModal from './BaseModal';
import { OMDBMovieExtended, OMDBResult } from '../../types/omdb';
import MovieResultRow from './MovieResultRow';
import { searchOMDB } from '../../app/actions/omdb';
import { getMovieByIMDBID } from '@/src/app/actions/movies';

interface SearchModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onMovieAdded?: () => void;
}

// Add logic for searching by title if needed
export default function SearchModal({ isOpen, setIsOpen, onMovieAdded }: SearchModalProps) {

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
            // Only fetch more data if we don't already have it
            if (!movie.Actors && !movie.Director && !movieIDsBeingFetched.current.has(movie.imdbID)) {
                void getMoreData(movie.imdbID);
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [omdbResults.length]);

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
        try {
            const data = await searchOMDB(imdbID) as OMDBMovieExtended;
            setOmdbResults((prev) => prev.map((movie) => (
                movie.imdbID === imdbID ? { ...movie, ...data } : movie
            )));
        } catch (error) {
            setErrorMessage(['Error', error instanceof Error ? error.message : 'Failed to fetch details']);
        } finally {
            movieIDsBeingFetched.current.delete(imdbID);
        }
    }

    async function search(query: string): Promise<void> {
        //Only search if query is at least 3 characters
        if (query.length < 3) {
            setOmdbResults([]);
            setErrorMessage(['', '']);
            return;
        }

        setLoading(true);
        try {
            const data = await searchOMDB(query) as OMDBResult;
            setErrorMessage(['', '']);
            setOmdbResults(data.Search);
        } catch (error) {
            setOmdbResults([]);
            setErrorMessage(['Error', error instanceof Error ? error.message : 'Failed to search']);
        } finally {
            setLoading(false);
        }
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
                                <MovieResultRow key={movie.imdbID} movie={movie} onAdd={onMovieAdded} />
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

