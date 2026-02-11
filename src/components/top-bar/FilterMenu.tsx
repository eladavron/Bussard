'use client';

import { Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger, Link, SharedSelection, Tooltip } from '@heroui/react';
import { GrFilter } from 'react-icons/gr';
import { IoClose } from 'react-icons/io5';
import { Movie } from '@/src/types/movie';
import { DiskOptionsContext } from '@/src/context/DiskOptionsContext';
import { useContext } from 'react';

interface SortMenuProps {
    isLoading?: boolean;
    filterOptions: SharedSelection;
    setFilterOptions: (keys: SharedSelection) => void;
    movies?: Movie[];
}


export default function FilterMenu({ isLoading, filterOptions, setFilterOptions, movies }: SortMenuProps) {
    const { allFormats, allRegions } = useContext(DiskOptionsContext)!;

    const filteredCount = (filterOptions as Set<string>).size;

    return (
        <div className='relative flex'>
            {filteredCount > 0 &&
                <Tooltip color='foreground' content={'Clear Filters'} placement='top' closeDelay={0}>
                    <button
                        className='absolute -top-0.75 -right-0.75 size-3 rounded bg-blue-200 z-100 text-xs cursor-pointer'
                        onClick={() => setFilterOptions(new Set())}
                    >
                        <IoClose />
                    </button>
                </Tooltip>}

            <Dropdown className='text-primary'>
                <DropdownTrigger>
                    <Link role='button' href="#"
                        className={`button-hollow tag cursor-pointer ${isLoading ? 'disabled' : ''}`}
                    >
                        <GrFilter />
                    </Link>
                </DropdownTrigger>
                <DropdownMenu selectionMode='multiple' selectedKeys={filterOptions} onSelectionChange={setFilterOptions}>
                    <DropdownSection showDivider title="Media Format">
                        {allFormats
                            .filter((format: string) => movies?.some(movie => movie.disks?.some(disk => disk.format.name === format)))
                            .map((format: string) => (
                                <DropdownItem key={format} textValue={format}>
                                    {format}
                                </DropdownItem>
                            ))
                        }
                    </DropdownSection>
                    <DropdownSection showDivider title="Regions">
                        {allRegions
                            .filter((region: string) => movies?.some(movie => movie.disks?.some(disk => disk.regions?.some(r => r.name === region))))
                            .map((region: string) => (
                                <DropdownItem key={region} textValue={region}>
                                    {region}
                                </DropdownItem>
                            ))
                        }
                    </DropdownSection>
                    <DropdownItem key="no-disks" textValue="No Disks">
                        No Disks
                    </DropdownItem>
                </DropdownMenu>
            </Dropdown>
        </div>
    );
}