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

export interface DiskViewProps {
    movie: Movie;
    onRefresh: () => void;
}

export default function DiskView({ movie, onRefresh }: DiskViewProps) {
    const [editMode, setEditMode] = useState(movie.disks?.length === 0);
    const [format, setFormat] = useState('');
    const [regions, setRegions] = useState<Set<string>>(new Set([]));
    const [allFormats, setAllFormats] = useState<string[]>([]);
    const [allRegions, setAllRegions] = useState<string[]>([]);
    const [filteredRegions, setFilteredRegions] = useState<string[]>([]);

    const isDigital = format === 'Digital';

    useEffect(() => {
        setFilteredRegions(allRegions.filter(r => {
            //Hide if the format and region combo already exists for the movie
            if (movie.disks?.some(d => d.format.name === format && d.regions?.some(r2 => r2.name === r))) {
                return false;
            }
            if (r === 'Region Free') {
                return true;
            }
            if (format === 'DVD') {
                return /^Region \d/.test(r);
            }
            if (format === 'Blu-Ray' || format === 'Blu-Ray 3D') {
                return /^Region [A-C]/.test(r);
            }
            if (format === '4K Ultra HD') {
                return r === 'Region Free';
            }
            return true; // no format selected yet — show all
        }));
        if (format === '4K Ultra HD') {
            setRegions(new Set(['Region Free']));
        }
    }, [format])

    useEffect(() => {
        getCachedDiskOptions().then(({ formats, regions }) => {
            setAllFormats(formats);
            setAllRegions(regions);
        });
    }, []);

    useEffect(() => {
        // Clear region when format changes and current selection is no longer valid
        if (isDigital || (regions.size > 0 && !filteredRegions.some(r => regions.has(r)))) {
            setRegions(new Set());
        }
    }, [format]);

    useEffect(() => {
        setEditMode(movie.disks?.length === 0);
    }, [movie.disks]);

    return (
        <>
            {editMode ? (
                <span className="flex items-center flex-wrap gap-2 w-full">
                    <Select placeholder="Format" size="sm" variant="bordered" value={format} onSelectionChange={value => setFormat(value.anchorKey || '')} classNames={{ trigger: 'min-w-fit px-2', value: '!overflow-visible !text-ellipsis-[unset] !truncate-none pr-5', selectorIcon: 'right-1 shrink-0' }} popoverProps={{ classNames: { content: 'w-fit min-w-0' } }} listboxProps={{ itemClasses: { title: 'whitespace-nowrap' } }}>
                        {allFormats.map(format => (
                            <SelectItem className="text-primary" key={format}>{format}</SelectItem>
                        ))}
                    </Select>
                    <Select
                        placeholder="Region"
                        size="sm"
                        variant="bordered"
                        selectionMode='multiple'
                        selectedKeys={regions}
                        isDisabled={!format || isDigital}
                        onChange={e => setRegions(new Set(e.target.value.split(',')))}
                        classNames={{ trigger: 'min-w-fit px-2', value: '!overflow-visible !text-ellipsis-[unset] !truncate-none pr-5', selectorIcon: 'right-1 shrink-0' }}
                        popoverProps={{ classNames: { content: 'w-fit min-w-0' } }}
                        listboxProps={{ itemClasses: { title: 'whitespace-nowrap' } }}
                    >
                        {filteredRegions.map(region => (
                            <SelectItem className="text-primary" key={region}>{region}</SelectItem>
                        ))}
                    </Select>
                    <div className="flex items-center gap-1 w-full justify-end">
                        {movie.disks?.length > 0 && (
                            <Tooltip color='foreground' content="Cancel" placement='top' closeDelay={0}>
                                <button className="button-hollow h-8" onClick={() => setEditMode(false)}>
                                    <IoCloseSharp />
                                </button>
                            </Tooltip>
                        )}
                        <Tooltip color='foreground' content="Save" placement='top' closeDelay={0}>
                            <button
                                className={`button-hollow h-8 ${!format || (!isDigital && regions.size === 0) ? 'disabled' : ''}`}
                                disabled={!format || (!isDigital && regions.size === 0)}
                                onClick={async () => {
                                    await addDisk(movie.id, format, isDigital ? null : Array.from(regions));
                                    setFormat('');
                                    setRegions(new Set());
                                    onRefresh();
                                }}
                            >
                                <IoCheckmark />
                            </button>
                        </Tooltip>
                    </div>
                </span>
            ) : (
                <span className="flex items-stretch gap-1 flex-wrap">
                    {movie.disks?.map(d =>
                        <span className="tag tag-gray font-mono p-0 flex items-center gap-1"
                            key={d.format.name + (d.regions?.map(r => r.name).join(',') ?? '')}>
                            {d.format.name} {d.regions?.length ? `(${d.regions.map((r, i) => i > 0 ? r.name.replace('Region ', '') : r.name).join(', ')})` : ''}
                            <Tooltip color='foreground' content="Remove Disk" placement='top' closeDelay={0}>
                                <Link role="button" className="button-link-secondary"
                                    onClick={async () => {
                                        await removeDisk(d.id);
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