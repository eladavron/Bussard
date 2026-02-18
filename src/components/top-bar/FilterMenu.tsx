'use client';

import { Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger, Link, SharedSelection, Tooltip } from '@heroui/react';
import { IoClose, IoFilter } from 'react-icons/io5';
import { OptionsContext } from '@/src/context/OptionsContext';
import { useContext } from 'react';
import { Movie } from '@/src/types/movie';

interface SortMenuProps {
    isLoading?: boolean;
    filterOptions: SharedSelection;
    setFilterOptions: (keys: SharedSelection) => void;
    allMovies: Movie[];
}


export default function FilterMenu({ isLoading, filterOptions, setFilterOptions, allMovies }: SortMenuProps) {
    const { allFormats, allRegions } = useContext(OptionsContext)!;

    const isFiltered = (filterOptions as Set<string>).size > 0;
    const filteredRegions = allRegions.filter(region => allMovies.some(movie => movie.disks?.some(disk => disk.regions?.some(r => r.name === region))));
    const filteredFormats = allFormats.filter(format => allMovies.some(movie => movie.disks?.some(disk => disk.format.name === format)));

    return (
        <div className='relative flex'>
            {isFiltered &&
                <Tooltip color='foreground' content={'Clear Filters'} placement='top' closeDelay={0}>
                    <button
                        className='absolute -top-1.5 -right-1.5 size-4 rounded-full tag-blue z-100 text-xs cursor-pointer foreground flex items-center justify-center'
                        onClick={() => setFilterOptions(new Set())}
                    >
                        <IoClose />
                    </button>
                </Tooltip>}

            <Dropdown className='text-primary'>
                <DropdownTrigger>
                    <Link role='button' href='#' className={`button-hollow tag cursor-pointer ${isLoading ? 'disabled' : ''}`}>
                        <IoFilter />
                    </Link>
                </DropdownTrigger>
                <DropdownMenu selectionMode='multiple' selectedKeys={filterOptions} onSelectionChange={setFilterOptions}>
                    <DropdownSection showDivider title='Media Format'>
                        <>
                            {filteredFormats.length > 0 && filteredFormats.map((format: string) => (
                                <DropdownItem key={format} textValue={format}>
                                    {format}
                                </DropdownItem>
                            ))}
                            {filteredFormats.length === 0 && <DropdownItem key='no-formats' textValue='No Formats'>No Movies in view have disks.</DropdownItem>}
                        </>
                    </DropdownSection>
                    <DropdownSection showDivider title='Regions'>
                        <>
                            {filteredRegions.length === 0 && <DropdownItem key='no-regions' textValue='No Regions'>No Movies in view have disks with region information.</DropdownItem>}
                            {filteredRegions.length > 0 && filteredRegions.map((region: string) => (
                                <DropdownItem key={region} textValue={region}>
                                    {region}
                                </DropdownItem>
                            ))
                            }
                        </>
                    </DropdownSection>
                    <DropdownItem key='no-disks' textValue='No Disks'>
                        No Disks
                    </DropdownItem>
                </DropdownMenu>
            </Dropdown>
        </div>
    );
}