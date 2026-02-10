'use client';

import Image from 'next/image';
import BussardLogo from '../assets/Bussard.svg';
import SettingsMenu from './top-bar/SettingsMenu';

export default function Header({ refreshMovies }: { refreshMovies: () => Promise<void> }) {
    return (
        <header className="main-header">
            <div className="flex items-center gap-3">
                <Image src={BussardLogo} alt="Bussard Logo" width={60} />
                <h1 className="movie-title">Codename "Bussard"</h1>
            </div>
            <SettingsMenu refreshMovies={refreshMovies} />
        </header>
    );
}
