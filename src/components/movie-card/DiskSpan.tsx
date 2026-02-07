'use client';

import { useEffect, useState } from 'react';
import { Movie } from '../../types/movie';
import { addDisk, removeDisk } from '@/src/app/actions/disks';
import { Select, SelectItem, Tooltip } from '@heroui/react';
import { getDiskOptions } from '@/src/lib/diskOptions';
import { IoCheckmark } from 'react-icons/io5';
import { IoCloseSharp } from 'react-icons/io5';
import { IoCloseCircleOutline } from 'react-icons/io5';
import { IoAddCircleOutline } from 'react-icons/io5';
import { Link } from '@heroui/react';

// Cache the promise so all DiskSpan instances share a single fetch
let diskOptionsPromise: ReturnType<typeof getDiskOptions> | null = null;
function getCachedDiskOptions() {
    if (!diskOptionsPromise) {
        diskOptionsPromise = getDiskOptions();
    }
    return diskOptionsPromise;
}

export interface DiskSpanProps {
    movie: Movie;
    onRefresh: () => void;
}

export default function DiskSpan({ movie, onRefresh }: DiskSpanProps) {
    const [editMode, setEditMode] = useState(movie.disks?.length === 0);
    const [format, setFormat] = useState('');
    const [region, setRegion] = useState('');
    const [allFormats, setAllFormats] = useState<string[]>([]);
    const [allRegions, setAllRegions] = useState<string[]>([]);

    const isDigital = format === 'Digital';

    const filteredRegions = allRegions.filter(r => {
        if (r === 'Region Free') return true;
        if (format === 'DVD') return /^Region \d/.test(r);
        if (format === 'Blu-Ray' || format === '4K Ultra HD') return /^Region [A-C]/.test(r);
        return true; // no format selected yet — show all
    });

    useEffect(() => {
        getCachedDiskOptions().then(({ formats, regions }) => {
            setAllFormats(formats);
            setAllRegions(regions);
        });
    }, []);

    useEffect(() => {
        // Clear region when format changes and current selection is no longer valid
        if (isDigital || (region && !filteredRegions.includes(region))) {
            setRegion('');
        }
    }, [format]);

    useEffect(() => {
        setEditMode(movie.disks?.length === 0);
    }, [movie.disks]);

    return (
        <>
            {editMode ? (
                <span className="flex items-center gap-2 w-full">
                    <Select placeholder="Format" size="sm" variant="bordered" value={format} onSelectionChange={value => setFormat(value.anchorKey || '')} classNames={{ trigger: 'min-w-fit px-2', value: '!overflow-visible !text-ellipsis-[unset] !truncate-none pr-5', selectorIcon: 'right-1 shrink-0' }} popoverProps={{ classNames: { content: 'w-fit min-w-0' } }} listboxProps={{ itemClasses: { title: 'whitespace-nowrap' } }}>
                        {allFormats.map(format => (
                            <SelectItem className="text-primary" key={format}>{format}</SelectItem>
                        ))}
                    </Select>
                    <Select placeholder="Region" size="sm" variant="bordered" value={region} isDisabled={isDigital} onSelectionChange={value => setRegion(value.anchorKey || '')} classNames={{ trigger: 'min-w-fit px-2', value: '!overflow-visible !text-ellipsis-[unset] !truncate-none pr-5', selectorIcon: 'right-1 shrink-0' }} popoverProps={{ classNames: { content: 'w-fit min-w-0' } }} listboxProps={{ itemClasses: { title: 'whitespace-nowrap' } }}>
                        {filteredRegions.map(region => (
                            <SelectItem className="text-primary" key={region}>{region}</SelectItem>
                        ))}
                    </Select>
                    <div className="flex items-center gap-1">
                        <Tooltip color='foreground' content="Save" placement='top' closeDelay={0}>
                            <button
                                className={`button-hollow h-8 ${!format || (!isDigital && !region) ? 'disabled' : ''}`}
                                disabled={!format || (!isDigital && !region)}
                                onClick={async () => {
                                    await addDisk(movie.id, format, isDigital ? null : region);
                                    onRefresh();
                                }}
                            >
                                <IoCheckmark />
                            </button>
                        </Tooltip>
                        {movie.disks?.length > 0 && (
                            <Tooltip color='foreground' content="Cancel" placement='top' closeDelay={0}>
                                <button className="button-hollow h-8" onClick={() => setEditMode(false)}>
                                    <IoCloseSharp />
                                </button>
                            </Tooltip>
                        )}
                    </div>
                </span>
            ) : (
                <span className="flex items-stretch gap-1">
                    {movie.disks?.map(d => 
                        <span className="tag tag-gray font-mono p-0 flex items-center gap-1"
                              key={d.format.name + (d.region?.name ?? '')}>
                            {d.format.name} {d.region?.name != null ? `(${d.region.name})` : ''}
                            <Tooltip color='foreground' content="Remove Disk" placement='top' closeDelay={0}>
                                <Link role="button" className="button-link-secondary"
                                    onClick={async () => {
                                        await removeDisk(movie.id, d.format.name, d.region?.name ?? null);
                                        onRefresh();
                                    }}
                                >
                                    <IoCloseCircleOutline />
                                </Link>
                            </Tooltip>
                        </span>)}
                    <Tooltip color='foreground' content="Add Disk" placement='top' closeDelay={0}>
                        <button className="button-hollow tag py-1 cursor-pointer" onClick={() => setEditMode(true)}>
                            <IoAddCircleOutline />
                        </button>
                    </Tooltip>
                </span>
            )}
        </>
    );
}