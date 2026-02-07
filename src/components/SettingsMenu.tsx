'use client';

import { Menu, MenuButton, MenuItem, MenuItems, MenuSeparator } from '@headlessui/react'
import { useState } from 'react';
import { exportMetadataToFile, getImportProgress, ImportProgress, startImport } from '../app/actions/metadata';
import { IoSettingsOutline, IoSunnySharp } from 'react-icons/io5';
import UploadModal from './modals/UploadModal';
import { Switch } from '@heroui/switch';
import { FaMoon } from 'react-icons/fa';
import { useTheme } from 'next-themes';
import { Tooltip } from '@heroui/react';
import { MimeType } from '../types/mime';
import ProgressModal from './modals/ProgressModal';

export default function SettingsMenu() {
    const [isUploadModalOpen, setUploadModalOpen] = useState(false);
    const [isProgressModalOpen, setProgressModalOpen] = useState(false);
    const [progress, setProgress] = useState(0);
    const [importErrors, setImportErrors] = useState<string[]>([]);
    const [importWarnings, setImportWarnings] = useState<string[]>([]);
    const [progressMessage, setProgressMessage] = useState('Processing...');
    const { theme, setTheme } = useTheme();

    return (
        <>
            <Menu as="div" className="relative inline-block">
                <Tooltip color='foreground' content="Settings" placement='bottom' closeDelay={0}>
                    <MenuButton className="button-hollow cursor-pointer">
                        <IoSettingsOutline />
                    </MenuButton>
                </Tooltip>

                <MenuItems transition className="menu-dropdown">
                    <MenuItem as="div" className="px-4 py-2">
                        <Switch
                            size="sm"
                            color="secondary"
                            thumbIcon={({ isSelected }) => isSelected ? <FaMoon className='text-purple-900' /> : <IoSunnySharp className="text-orange-400" />}
                            isSelected={theme === 'dark'}
                            onValueChange={(checked) => {
                                console.log('Toggle clicked, new value:', checked);
                                setTheme(checked ? 'dark' : 'light');
                            }}
                        ><span className='text-primary'>Dark Mode</span></Switch>
                    </MenuItem>
                    <MenuSeparator className="my-1 h-px bg-gray-200 dark:bg-gray-700" />
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
                    setProgressModalOpen(true)
                    const UUID = await startImport(formData);
                    //TODO: timeout
                    while (progress < 100) {
                        //Get progress from server
                        const currentProgress = await getImportProgress(UUID) as ImportProgress;
                        setProgress(currentProgress.percentage);
                        setProgressMessage(currentProgress.message);
                        setImportErrors(currentProgress.errors);
                        setImportWarnings(currentProgress.warnings);
                        await new Promise(resolve => setTimeout(resolve, 500)); //Wait for 500ms before polling again to avoid spamming the server with requests
                    }
                    setUploadModalOpen(false);
                }}
                title="Import Movie Metadata"
                message="Select a metadata JSON file to import movie data."
                fileTypes={[MimeType.JSON, MimeType.CSV]}
            />
            <ProgressModal
                isOpen={isProgressModalOpen}
                title="Progress"
                onClose={() => setProgressModalOpen(false)}
                message={progressMessage}
                progress={progress}
                warnings={importWarnings}
                errors={importErrors}
            />
        </>
    )
}