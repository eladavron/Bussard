'use client';

import { Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger, Link, SharedSelection, Tooltip } from '@heroui/react';
import { IoClose, IoFilter } from 'react-icons/io5';
import { DiskOptionsContext } from '@/src/context/DiskOptionsContext';
import { useContext } from 'react';

interface SortMenuProps {
    isLoading?: boolean;
    filterOptions: SharedSelection;
    setFilterOptions: (keys: SharedSelection) => void;
}


export default function FilterMenu({ isLoading, filterOptions, setFilterOptions }: SortMenuProps) {
    const { allFormats, allRegions } = useContext(DiskOptionsContext)!;

    const filteredCount = (filterOptions as Set<string>).size;
    const filteredRegions = allRegions.filter(region => (filterOptions as Set<string>).has(region));
    const filteredFormats = allFormats.filter(format => (filterOptions as Set<string>).has(format));

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