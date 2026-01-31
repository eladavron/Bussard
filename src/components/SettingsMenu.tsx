'use client';

import { Menu, MenuButton, MenuItem, MenuItems, MenuSeparator } from '@headlessui/react'
import { useState } from 'react';
import { exportMetadataToFile, importMetadataFromFile } from '../app/metadata/actions';
import { IoSettingsOutline, IoSunnySharp } from "react-icons/io5";
import UploadModal from './UploadModal';
import { Switch } from "@heroui/switch";
import { MdModeNight } from 'react-icons/md';
import { FaMoon } from 'react-icons/fa';
import { useTheme } from 'next-themes';

export default function SettingsMenu() {
    const [isUploadModalOpen, setUploadModalOpen] = useState(false);
    const { theme, setTheme } = useTheme();

    return (
        <>
            <Menu as="div" className="relative inline-block">
                <MenuButton className="button-hollow flex items-center gap-1">
                    <IoSettingsOutline size={18} />
                </MenuButton>

                <MenuItems transition className="menu-dropdown">
                    <MenuItem as="div" className="px-4 py-2">
                        <Switch
                            size="sm"
                            color="secondary"
                            thumbIcon={({isSelected}) => isSelected ? <FaMoon className='text-purple-900'/> : <IoSunnySharp className="text-orange-400"/>}
                            isSelected={theme === 'dark'}
                            onValueChange={(checked) => {
                                console.log('Toggle clicked, new value:', checked);
                                setTheme(checked ? 'dark' : 'light');
                            }}
                        ><span className='text-primary'>Dark Mode</span></Switch>
                    </MenuItem>
                    <MenuSeparator />
                    <MenuItem>
                        <a href="#" className="menu-item-link" onClick={() => setUploadModalOpen(true)}>
                            Import...
                        </a>
                    </MenuItem>
                    <MenuItem>
                        <a href="#" className="menu-item-link" onClick={() => exportMetadataToFile().then((blob: Blob | MediaSource) => {
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'backup_metadata.json';
                            document.body.appendChild(a);
                            a.click();
                            a.remove();
                            URL.revokeObjectURL(url);
                        })}>
                            Export...
                        </a>
                    </MenuItem>
                </MenuItems>
            </Menu>
            <UploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setUploadModalOpen(false)}
                onUpload={async (formData) => {
                    importMetadataFromFile(formData);
                    setUploadModalOpen(false);
                }}
                title="Import Movie Metadata"
                message="Select a metadata JSON file to import movie data."
            />
        </>
    )
}