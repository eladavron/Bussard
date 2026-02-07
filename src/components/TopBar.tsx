'use client';

import { Link, Tooltip } from '@heroui/react';
import { useState } from 'react';
import { IoAddCircleOutline, IoReload } from 'react-icons/io5';
import SearchModal from './modals/SearchModal';
import { Movie } from '../types/movie';

interface TopBarProps {
    movies: Movie[];
    refreshMovies: () => Promise<void>;
}

export default function TopBar({ movies, refreshMovies }: TopBarProps) {
    const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);

    return (
        <>
            <div className="flex gap-2 mb-6">
                <span className="tag tag-blue">
                    {movies.length} Movies
                </span>
                <Tooltip color='foreground' content='Refresh' placement='top' closeDelay={0}>
                    <Link role='button' href="#" onClick={async () => {
                        await refreshMovies();
                    }} className="button-hollow tag cursor-pointer">
                        <IoReload />
                    </Link>
                </Tooltip>
                <Tooltip color='foreground' content="Add Movie" placement='top' closeDelay={0}>
                    <Link role='button' href="#" onClick={() => setIsSearchModalOpen(true)} className="button-hollow tag cursor-pointer">
                        <IoAddCircleOutline />
                    </Link>
                </Tooltip>
            </div>
            <SearchModal isOpen={isSearchModalOpen} setIsOpen={setIsSearchModalOpen} onMovieAdded={async () => {
                await refreshMovies();
                setIsSearchModalOpen(false);
            }} />
        </>
    )
}