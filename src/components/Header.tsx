'use client';

import SettingsMenu from './SettingsMenu';

export default function Header() {
  return (
    <header className="main-header">
      <h1 className="">My Collection</h1>
      <SettingsMenu />
    </header>
  );
}
