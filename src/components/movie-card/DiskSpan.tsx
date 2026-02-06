'use client';

import { useEffect, useState } from "react";
import { Movie } from "../../types/movie";
import { addDisk } from "@/src/app/actions/disks";
import { Select, SelectItem, Tooltip } from "@heroui/react";
import { IoAddCircleOutline } from "react-icons/io5";
import { getDiskOptions } from "@/src/lib/diskOptions";
import { refreshMovies } from "@/src/lib/global";

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

    useEffect(() => {
        getCachedDiskOptions().then(({ formats, regions }) => {
            setAllFormats(formats);
            setAllRegions(regions);
        });
    }, []);

    useEffect(() => {
        setEditMode(movie.disks?.length === 0);
    }, [movie.disks]);

    return (
        <>
            {editMode ? (
                <span className="flex items-stretch gap-2 w-full">
                    <Select placeholder="Format" size="sm" variant="bordered" value={format} onSelectionChange={value => setFormat(value.anchorKey || '')} classNames={{ trigger: "min-w-fit px-2", value: "!overflow-visible !text-ellipsis-[unset] !truncate-none pr-5", selectorIcon: "right-1 shrink-0" }} popoverProps={{ classNames: { content: "w-fit min-w-0" } }} listboxProps={{ itemClasses: { title: "whitespace-nowrap" } }}>
                        {allFormats.map(format => (
                            <SelectItem className="text-primary" key={format}>{format}</SelectItem>
                        ))}
                    </Select>
                    <Select placeholder="Region" size="sm" variant="bordered" value={region} onSelectionChange={value => setRegion(value.anchorKey || '')} classNames={{ trigger: "min-w-fit px-2", value: "!overflow-visible !text-ellipsis-[unset] !truncate-none pr-5", selectorIcon: "right-1 shrink-0" }} popoverProps={{ classNames: { content: "w-fit min-w-0" } }} listboxProps={{ itemClasses: { title: "whitespace-nowrap" } }}>
                        {allRegions.map(region => (
                            <SelectItem className="text-primary" key={region}>{region}</SelectItem>
                        ))}
                    </Select>
                    <div className="flex self-stretch">
                        <Tooltip color='foreground' content="Add Disk" placement='top' closeDelay={0}>
                            <button className="button-hollow h-full" onClick={async () => {
                                await addDisk(movie.id, format, region);
                                onRefresh()
                            }}
                            ><IoAddCircleOutline /></button>
                        </Tooltip>
                    </div>
                </span>
            ) : (
                <span className="tag tag-gray font-mono p-0">
                    {movie.disks?.map(d => `${d.format.name} (${d.region.name})`).join(', ')}
                </span>
            )}
        </>
    );
}