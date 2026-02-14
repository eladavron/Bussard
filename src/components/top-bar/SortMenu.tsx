'use client';

import { Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger, Link, Switch } from '@heroui/react';
import { SortBy, SortOption, SortOrder } from '../../lib/sorting';
import { FaSortAmountDown } from "react-icons/fa";
import { FaCheck } from 'react-icons/fa';

interface SortMenuProps {
    isLoading?: boolean;
    sortOption: SortOption;
    setSortOption: (option: SortOption) => void;
}

export default function SortMenu({ isLoading, sortOption, setSortOption }: SortMenuProps) {

    function handleAction(key: React.Key) {
        switch (key) {
            case 'title':
                setSortOption({ ...sortOption, sortBy: SortBy.TITLE });
                break;
            case 'year':
                setSortOption({ ...sortOption, sortBy: SortBy.YEAR });
                break;
            case 'asc':
                setSortOption({ ...sortOption, sortOrder: SortOrder.ASC });
                break;
            case 'desc':
                setSortOption({ ...sortOption, sortOrder: SortOrder.DESC });
                break;
        }
    }

    function handleIgnoreArticlesChange(ignoreArticles: boolean) {
        setSortOption({
            ...sortOption,
            ignoreArticles,
        });
    }

    const checkIcon = <FaCheck className="text-secondary" size={12} />;

    return (
        <Dropdown className='text-primary' closeOnSelect={false}>
            <DropdownTrigger>
                <Link role='button' href="#" className={`button-hollow tag cursor-pointer ${isLoading ? 'disabled' : ''}`}>
                    <FaSortAmountDown />
                </Link>
            </DropdownTrigger>
            <DropdownMenu onAction={handleAction}>
                <DropdownSection showDivider title="Sort By">
                    <DropdownItem key="title" endContent={sortOption.sortBy === SortBy.TITLE ? checkIcon : null}>Title</DropdownItem>
                    <DropdownItem key="year" endContent={sortOption.sortBy === SortBy.YEAR ? checkIcon : null}>Year</DropdownItem>
                </DropdownSection>
                <DropdownSection showDivider title="Sort Order">
                    <DropdownItem key="sortOrder" isReadOnly textValue="Sort Order">
                        <Switch
                            size="sm"
                            color="secondary"
                            isSelected={sortOption.sortOrder === SortOrder.ASC}
                            onValueChange={(checked) => handleAction(checked ? 'asc' : 'desc')}
                        >
                            <span className='text-primary'>{sortOption.sortOrder === SortOrder.ASC ? 'Ascending' : 'Descending'}</span>
                        </Switch>
                    </DropdownItem>
                </DropdownSection>
                <DropdownSection title="Options">
                    <DropdownItem key="ignoreArticles" isReadOnly textValue="Ignore Articles">
                        <Switch
                            size="sm"
                            color="secondary"
                            isSelected={sortOption.ignoreArticles}
                            onValueChange={(checked) => handleIgnoreArticlesChange(checked)}
                        ><span className='text-primary'>Ignore Articles (A, An, The)</span>
                        </Switch>
                    </DropdownItem>
                </DropdownSection>
            </DropdownMenu>
        </Dropdown>
    );
}