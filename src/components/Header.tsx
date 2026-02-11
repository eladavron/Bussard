'use client';

import Image from 'next/image';
import BussardLogo from '../assets/Bussard.svg';
import SettingsMenu from './top-bar/SettingsMenu';
import { IoAddCircleOutline } from 'react-icons/io5';
import SearchModal from './modals/SearchModal';
import { useState } from 'react';
import { Tooltip } from '@heroui/react';

export default function Header({ refreshMovies }: { refreshMovies: () => Promise<void> }) {
    const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
    return (
        <>
            <header className="main-header">
                <div className="flex items-center gap-3">
                    <Image src={BussardLogo} alt="Bussard Logo" width={60} />
                    <h1 className="movie-title">Codename "Bussard"</h1>
                </div>
                <div className="flex gap-1 items-center justify-end">
                <Tooltip content="Add Movie" color='foreground'>
                    <button className="button-hollow cursor-pointer" onClick={() => setIsSearchModalOpen(true)}><IoAddCircleOutline /></button>
                </Tooltip>
                <Tooltip content="Settings" color='foreground'>
                    <SettingsMenu refreshMovies={refreshMovies} />
                </Tooltip>
                </div>
            </header>
            <SearchModal
                isOpen={isSearchModalOpen}
                setIsOpen={setIsSearchModalOpen}
                refreshMovies={refreshMovies} 
            />
        </>
    );
}
