'use client';

import React, { useState, useEffect, useRef } from 'react';
import BaseModal from './BaseModal';
import { OMDBMovieExtended, OMDBResult } from '../../types/omdb';
import MovieResultRow from './MovieResultRow';
import { searchByBarcode, searchOMDB, searchOMDBByParameter } from '../../app/actions/omdb';
import { Alert, Skeleton, Tab, Tabs, Tooltip } from '@heroui/react';
import { IoBarcodeOutline, IoSearch } from 'react-icons/io5';
import { BrowserMultiFormatReader } from '@zxing/browser';

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
    const [searchErrorMessage, setSearchErrorMessage] = useState<[string, string]>(['', '']);
    const [scanErrorMessage, setScanErrorMessage] = useState<[string, string]>(['', '']);
    const [isCameraReady, setIsCameraReady] = useState<boolean>(false);
    const [loadedMovieIDs, setLoadedMovieIDs] = useState<Set<string>>(new Set());
    const [addMultiple, setAddMultiple] = useState<boolean>(false);
    const [selectedTab, setSelectedTab] = useState<string>('search');
    const movieIDsBeingFetched = useRef<Set<string>>(new Set());
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream>(null);
    const [scanResults, setScanResults] = useState<OMDBMovieExtended | null>(null);
    const [scanResultLoading, setScanResultLoading] = useState<boolean>(false);

    function resetScanner() {
        setScanResults(null);
        setScanErrorMessage(['', '']);
        stopCamera();
    }

    function resetSearch() {
        setOmdbResults([]);
        setSearchQuery('');
        setSearchErrorMessage(['', '']);
        setLoadedMovieIDs(new Set());
    }

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
            resetSearch();
            resetScanner();
        }
    }, [isOpen]);

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    }

    function setUpCamera() {
        const codeReader = new BrowserMultiFormatReader();
        let cleanup = () => { };

        if (videoRef.current) {
            // Handler for when the camera is ready
            const handleLoadedMetadata = () => setIsCameraReady(true);
            videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);

            codeReader.decodeFromVideoDevice(
                undefined, // use default camera
                videoRef.current,
                async (result, error, controls) => {
                    if (videoRef.current && videoRef.current.srcObject) {
                        streamRef.current = videoRef.current.srcObject as MediaStream;
                    }
                    if (result) {
                        stopCamera();
                        const barcode = result.getText();
                        setScanResultLoading(true);
                        const results = await searchByBarcode(barcode);
                        if (results instanceof Error) {
                            setScanErrorMessage(['Error scanning barcode', results.message]);
                            setScanResultLoading(false);
                            return;
                        }
                        setScanResults(results);
                        setScanResultLoading(false);
                    }
                },
            );

            // Cleanup function to remove event listener and stop camera
            cleanup = () => {
                videoRef.current?.removeEventListener('loadedmetadata', handleLoadedMetadata);
                stopCamera();
                setIsCameraReady(false);
            };
        }

        return cleanup;
    }

    useEffect(() => {

        if (selectedTab === 'search') {
            resetScanner();
        } else if (selectedTab === 'barcode') {
            resetSearch();
            return setUpCamera();
        }
    }, [selectedTab, scanResults]);

    async function getMoreData(imdbID: string): Promise<void> {
        if (movieIDsBeingFetched.current.has(imdbID)) {
            return;
        }
        movieIDsBeingFetched.current.add(imdbID);
        try {
            const data = await searchOMDBByParameter({ imdbID }) as OMDBMovieExtended;
            extendedDataCache.set(imdbID, data);
            setOmdbResults((prev) => prev.map((movie) => (
                movie.imdbID === imdbID ? { ...movie, ...data } : movie
            )));
            setLoadedMovieIDs((prev) => new Set(prev).add(imdbID));
        } catch (error) {
            setSearchErrorMessage(['Error', error instanceof Error ? error.message : 'Failed to fetch details']);
        } finally {
            movieIDsBeingFetched.current.delete(imdbID);
        }
    }

    async function search(query: string): Promise<void> {
        //Only search if query is at least 3 characters
        if (query.length < 3) {
            setOmdbResults([]);
            setSearchErrorMessage(['', '']);
            return;
        }

        setLoading(true);
        try {
            const data = await searchOMDB(query) as OMDBResult;
            setSearchErrorMessage(['', '']);
            setOmdbResults(data.Search ?? []);
            setLoadedMovieIDs(new Set());
        } catch (error) {
            setOmdbResults([]);
            setSearchErrorMessage(['Error', error instanceof Error ? error.message : 'Failed to search']);
        } finally {
            setLoading(false);
        }
    }

    return (
        <BaseModal
            title='Search by IMDB ID or Title'
            isOpen={isOpen} onClose={() => {
                stopCamera();
                setIsOpen(false);
            }
            }
            className='w-full max-w-full sm:max-w-2xl'
            body={
                <>
                    <Tabs selectedKey={selectedTab} onSelectionChange={(key: React.Key) => setSelectedTab(key.toString())} className='w-full'>
                        <Tab key='search' title={<div className='flex items-center gap-2'><IoSearch /> Search</div>}>
                            <div className='flex justify-center'>
                                <div className='w-full mb-0 flex flex-col gap-1 items-end'>
                                    <Tooltip color='foreground' content='Add multiple movies from search results without closing the modal' placement='top' closeDelay={0}>
                                        <label className='text-sm text-secondary cursor-pointer flex items-center gap-2 float-end'>
                                            Add Multiple
                                            <input id='addMultiple' type='checkbox' checked={addMultiple} onChange={(e) => setAddMultiple(e.target.checked)} />
                                        </label>
                                    </Tooltip>
                                    <input
                                        className='input-default w-full'
                                        name='search'
                                        placeholder='tt1234567 or "Interstellar"...'
                                        autoComplete='off'
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                        }}
                                    />
                                </div>
                            </div>
                            {searchErrorMessage[0] && <Alert color='danger'>{searchErrorMessage[0]}<br /><pre>{searchErrorMessage[1]}</pre></Alert>}
                            {loading && (
                                <ul>
                                    <MovieResultRow key='skeleton1' isLoading={true} />
                                    <MovieResultRow key='skeleton2' isLoading={true} />
                                    <MovieResultRow key='skeleton3' isLoading={true} />
                                </ul>
                            )}
                            {!loading && !searchErrorMessage[0] && searchQuery && <div>
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
                                ) : (!loading && <p className='text-primary'>No results found.</p>)
                                }
                            </div>
                            }
                        </Tab>
                        <Tab key='barcode' title={<div className='flex items-center gap-2'><IoBarcodeOutline /> Barcode</div>}>
                            <div className='flex flex-col'>
                                {!isCameraReady && <Skeleton className='w-full h-96 rounded-xl' />}
                                {!scanResults && !scanResultLoading && !scanErrorMessage[0] && <video ref={videoRef} className={`w-full rounded-xl ${isCameraReady ? '' : 'h-0'}`} />}
                                {!scanResults && scanResultLoading && (<div className='flex flex-col items-center gap-4'>
                                    <div className='w-full'>
                                        <MovieResultRow isLoading={true} />
                                    </div>
                                </div>
                                )}
                                {scanErrorMessage[0] && <Alert color='danger'>{scanErrorMessage[0]}<br /><pre>{scanErrorMessage[1]}</pre></Alert>}
                                {scanResults &&
                                    <div>
                                        <h2 className='text-lg font-bold mb-4'>Scan Results:</h2>
                                        <MovieResultRow isLoading={scanResultLoading} movie={scanResults} extendedDataLoaded={true} onAdd={async () => {
                                            await refreshMovies();
                                            setScanResults(null);
                                        }} />
                                        <button className='button-secondary float-end flex gap-2 items-stretch' onClick={() => setScanResults(null)}>
                                            <IoBarcodeOutline className='size-auto' />
                                            Scan Again
                                        </button>
                                    </div>
                                }
                            </div>
                        </Tab>
                    </Tabs>
                </>
            }
        />
    );
}

