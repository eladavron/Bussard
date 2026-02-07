'use client';

import { useState, useEffect, useRef } from 'react';
import BaseModal from './BaseModal';
import { OMDBMovieExtended, OMDBResult } from '../../types/omdb';
import MovieResultRow from './MovieResultRow';
import { searchOMDB } from '../../app/actions/omdb';
import { Tooltip } from '@heroui/react';

interface SearchModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    refreshMovies: () => Promise<void>;
}

// Add logic for searching by title if needed
// Cache extended movie data across searches
const extendedDataCache = new Map<string, OMDBMovieExtended>();

export default function SearchModal({ isOpen, setIsOpen, refreshMovies }: SearchModalProps) {

    const [omdbResults, setOmdbResults] = useState<OMDBMovieExtended[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<[string, string]>(['', '']);
    const [loadedMovieIDs, setLoadedMovieIDs] = useState<Set<string>>(new Set());
    const [addMultiple, setAddMultiple] = useState<boolean>(false);
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
            if (!movie.Actors && !movie.Director && !movieIDsBeingFetched.current.has(movie.imdbID)) {
                // Use cached data if available
                const cached = extendedDataCache.get(movie.imdbID);
                if (cached) {
                    setOmdbResults((prev) => prev.map((m) => (
                        m.imdbID === movie.imdbID ? { ...m, ...cached } : m
                    )));
                    setLoadedMovieIDs((prev) => new Set(prev).add(movie.imdbID));
                } else {
                    void getMoreData(movie.imdbID);
                }
            }
        });
    }, [omdbResults?.length]);

    useEffect(() => {
        if (!isOpen) {
            setOmdbResults([]);
            setSearchQuery('');
            setErrorMessage(['', '']);
            setLoadedMovieIDs(new Set());
        }
    }, [isOpen]);

    async function getMoreData(imdbID: string): Promise<void> {
        if (movieIDsBeingFetched.current.has(imdbID)) {
            return;
        }
        movieIDsBeingFetched.current.add(imdbID);
        try {
            const data = await searchOMDB(imdbID) as OMDBMovieExtended;
            extendedDataCache.set(imdbID, data);
            setOmdbResults((prev) => prev.map((movie) => (
                movie.imdbID === imdbID ? { ...movie, ...data } : movie
            )));
            setLoadedMovieIDs((prev) => new Set(prev).add(imdbID));
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
            setOmdbResults(data.Search ?? []);
            setLoadedMovieIDs(new Set());
        } catch (error) {
            setOmdbResults([]);
            setErrorMessage(['Error', error instanceof Error ? error.message : 'Failed to search']);
        } finally {
            setLoading(false);
        }
    }

    return (
        <BaseModal
            title={
                <span className="flex flex-col gap-2">
                    <span>Search by IMDB ID or Title...</span>
                </span>
            }
            isOpen={isOpen} onClose={() => setIsOpen(false)}
            className='max-w-1/2'
            body={<>
                <div className="flex justify-center">
                    <div className='w-full mb-0'>
                        <Tooltip color='foreground' content='Add multiple movies from search results without closing the modal' placement='top' closeDelay={0}>
                            <label className="text-sm text-secondary cursor-pointer flex items-center gap-2 float-end">
                                Add Multiple
                                <input id="addMultiple" type="checkbox" checked={addMultiple} onChange={(e) => setAddMultiple(e.target.checked)} />
                            </label>
                        </Tooltip>
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
                                <MovieResultRow key={movie.imdbID} movie={movie} extendedDataLoaded={loadedMovieIDs.has(movie.imdbID)} onAdd={async () => {
                                    await refreshMovies();
                                    if (!addMultiple) {
                                        setIsOpen(false);
                                    }
                                }} />
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

