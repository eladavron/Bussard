'use client';

import { useEffect, useState } from "react";
import { Movie } from "../../types/movie";
import { addDisk, getAllFormats, getAllRegions } from "@/src/app/actions/disks";
import { Select, SelectItem, Tooltip } from "@heroui/react";
import { IoAddCircleOutline } from "react-icons/io5";
import { getDiskOptions } from "@/src/lib/diskOptions";

export default function DiskSpan(movie: Movie) {
    const [editMode, setEditMode] = useState(movie.disks?.length === 0);
    const [format, setFormat] = useState('');
    const [region, setRegion] = useState('');

    const FORMATS = ["FOO", "BAR", "BAZ"]; // Placeholder until we can load actual formats
    const REGIONS = ["REGION1", "REGION2", "REGION3"]; // Placeholder until we can load actual regions

    useEffect(() => {
        setEditMode(movie.disks?.length === 0);
    }, [movie.disks]);

    return (
        <>
            {editMode ? (
                <span className="flex items-stretch gap-2 w-full">
                    <Select label="Format" size="sm" variant="bordered" value={format} onSelectionChange={value => setFormat(value.anchorKey || '')}>
                        {FORMATS.map(format => (
                            <SelectItem className="text-primary" key={format}>{format}</SelectItem>
                        ))}
                    </Select>
                    <Select label="Region" size="sm" variant="bordered" value={region} onSelectionChange={value => setRegion(value.anchorKey || '')}>
                        {REGIONS.map(region => (
                            <SelectItem className="text-primary" key={region}>{region}</SelectItem>
                        ))}
                    </Select>
                    <div className="flex self-stretch">
                        <Tooltip color='foreground' content="Add Disk" placement='top' closeDelay={0}>
                            <button className="button-hollow h-full" onClick={async () => {
                                await addDisk(movie.id, format, region)
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