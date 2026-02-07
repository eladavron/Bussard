'use client';

import { Input, Link, Skeleton, Tooltip } from '@heroui/react';
import { useState } from 'react';
import { IoAddCircleOutline, IoReload } from 'react-icons/io5';
import SearchModal from './modals/SearchModal';
import { Movie } from '../types/movie';

interface TopBarProps {
    movies: Movie[];
    refreshMovies: () => Promise<void>;
    setFilterQuery: (query: string) => void;
    filterQuery: string;
    loading: boolean;
}

export default function TopBar({ movies, refreshMovies, setFilterQuery, filterQuery, loading }: TopBarProps) {
    const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);

    return (
        <>
            {loading && <div className="flex gap-2 mb-6">
                <Skeleton className="w-22 h-7 tag" />
                <Skeleton className="w-11 h-7 tag" />
                <Skeleton className="w-11 h-7 tag" />
            </div>}
            {!loading &&
                <div className='flex justify-between items-center mb-3'>
                    <div className="flex gap-2">
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
                        <Tooltip color='foreground' content="Add Movie" placement='top' closeDelay={0}>
                            <Link role='button' href="#" onClick={() => setIsSearchModalOpen(true)} className={`button-hollow tag cursor-pointer ${loading ? 'disabled' : ''}`}>
                                <IoAddCircleOutline />
                            </Link>
                        </Tooltip>
                    </div>
                    <Input type="text" placeholder="Search movies..." className="shrink w-1/2" disabled={loading} value={filterQuery} onChange={(e) => setFilterQuery(e.target.value)} />
                </div>
            }
            <SearchModal isOpen={isSearchModalOpen} setIsOpen={setIsSearchModalOpen} refreshMovies={refreshMovies} />
        </>
    )
}