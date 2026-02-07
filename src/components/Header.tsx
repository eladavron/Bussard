'use client';

import Image from 'next/image';
import SettingsMenu from './SettingsMenu';
import BussardLogo from '../assets/Bussard.svg';

export default function Header() {
    return (
        <header className="main-header ">
            <div className="flex items-center gap-3">
                <Image src={BussardLogo} alt="Bussard Logo" width={60} />
                <h1>Codename "Bussard"</h1>
            </div>
            <SettingsMenu />
        </header>
    );
}
