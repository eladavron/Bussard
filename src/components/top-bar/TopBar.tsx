'use client';

import { Input, Link, Skeleton, Tooltip } from '@heroui/react';
import { useState } from 'react';
import { IoAddCircleOutline, IoReload, IoSearch } from 'react-icons/io5';
import SearchModal from '../modals/SearchModal';
import { Movie } from '../../types/movie';
import { SortOption } from '../../lib/sorting';
import SortMenu from './SortMenu';
import { Alphabet } from '../../lib/global';


interface TopBarProps {
    movies: Movie[];
    refreshMovies: () => Promise<void>;
    setFilterQuery: (query: string) => void;
    filterQuery: string;
    sortOption: SortOption;
    setSortOption: (option: SortOption) => void;
    loading: boolean;
    seenLetters: Set<string>;
}

export default function TopBar({ movies, refreshMovies, setFilterQuery, filterQuery, sortOption, setSortOption, loading, seenLetters }: TopBarProps) {
    const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);

    return (
        <>
            <div className='flex justify-between items-center mb-3 flex-wrap gap-2'>
                <div className="flex gap-2">
                    {loading ? (
                        <>
                            <Skeleton className="w-22 h-7 tag" />
                            <Skeleton className="w-11 h-7 tag" />
                            <Skeleton className="w-11 h-7 tag" />
                            <Skeleton className="w-11 h-7 tag" />
                        </>
                    ) : (
                        <>
                            <span className="tag tag-blue">
                                {movies.length} Movies
                            </span>
                            <Tooltip color='foreground' content='Refresh' placement='top' closeDelay={0}>
                                <Link role='button' href="#" onClick={async () => {
                                    await refreshMovies();
                                }}
                                    className={`button-hollow tag cursor-pointer ${loading ? 'disabled' : ''}`}>
                                    <IoReload />
                                </Link>
                            </Tooltip>
                            <Tooltip color='foreground' content="Sort Options" placement='top' closeDelay={0}>
                                <SortMenu isLoading={loading} sortOption={sortOption} setSortOption={setSortOption} />
                            </Tooltip>
                            <Tooltip color='foreground' content="Add Movie" placement='top' closeDelay={0}>
                                <Link role='button' href="#" onClick={() => setIsSearchModalOpen(true)} className={`button-hollow tag cursor-pointer ${loading ? 'disabled' : ''}`}>
                                    <IoAddCircleOutline />
                                </Link>
                            </Tooltip>
                        </>
                    )}
                </div>
                {<div className='flex gap-1 flex-wrap'>
                    {Alphabet.map(letter =>
                        loading ? <Skeleton key={letter} className="w-3 h-6" /> :
                            (seenLetters.has(letter) ?
                                <Tooltip key={letter} color='foreground' content={`Jump to movies starting with ${letter}`} placement='top' closeDelay={0}>
                                    <Link key={letter} className='cursor-pointer' onClick={() => document.getElementById(`letter-${letter}`)?.scrollIntoView({ behavior: 'smooth' })}>{letter}</Link>
                                </Tooltip> : <span key={letter} className='text-secondary opacity-50'>{letter}</span>)
                    )}
                </div>}
                <div className="w-full sm:w-auto">
                    <Input
                        type="text"
                        placeholder="Search movies..."
                        radius="full"
                        className='w-full text-primary sm:w-64'
                        value={filterQuery}
                        isClearable
                        startContent={<IoSearch className='text-secondary' />}
                        onChange={(e) => setFilterQuery(e.target.value)}
                        onClear={() => setFilterQuery('')}
                    />
                </div>
            </div>
            <SearchModal isOpen={isSearchModalOpen} setIsOpen={setIsSearchModalOpen} refreshMovies={refreshMovies} />
        </>
    );
}