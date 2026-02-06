import { OMDBMovieExtended } from '@/src/types/omdb';
import { Skeleton } from '@heroui/react';
import { useState } from 'react';
import { IoCheckmarkCircle } from "react-icons/io5";import { IoAddCircleOutline } from "react-icons/io5";

interface MovieResultRowProps {
    movie?: OMDBMovieExtended;
    isLoading?: boolean;
}

export default function MovieResultRow({ movie, isLoading = false }: MovieResultRowProps) {
    const [imageError, setImageError] = useState(false);

    if (isLoading) {
        return (
            <li className="mb-2 p-2 border border-default rounded">
                <div className="flex">
                    <Skeleton className="w-16 h-24 mr-4 rounded" />
                    <div className="grow">
                        <Skeleton className="h-6 w-3/4 mb-2 rounded" />
                        <Skeleton className="h-4 w-1/4 mb-2 rounded" />
                        <Skeleton className="h-4 w-1/3 mb-2 rounded" />
                        <Skeleton className="h-4 w-3/4 rounded" />
                    </div>
                </div>
            </li>
        );
    }

    if (!movie) return null;
    return (
        <li className="mb-2 p-2 border border-default rounded">
            <div className="flex">
                {movie.Poster !== 'N/A' && !imageError ? (
                    <img
                        src={movie.Poster}
                        alt={`${movie.Title} Poster`}
                        className="w-16 h-auto mr-4"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="w-16 h-24 bg-gray-200 flex items-center justify-center mr-4">
                        <span className="text-gray-500 text-sm">No Image</span>
                    </div>
                )}
                <div className="grow">
                    <div className='flex items-start justify-between'>
                        <h3 className="text-primary text-lg font-semibold">{movie.Title}</h3>
                        <a href={`https://www.imdb.com/title/${movie.imdbID}`} className="text-sm text-secondary" target="_blank" rel="noopener noreferrer"><code>{movie.imdbID}</code></a>
                    </div>
                    <p className="text-sm text-secondary">{movie.Year}</p>
                    <p className="text-sm text-secondary flex items-center">
                        Director: {movie.Director ? movie.Director : <Skeleton className="h-4 w-20 rounded inline-block ml-2" />}
                    </p>
                    <p className='text-sm text-secondary'>
                        Actors: {movie.Actors ? movie.Actors : <Skeleton className="h-4 w-3/4 rounded" />}
                    </p>
                </div>
                <div className="flex items-center ml-4">
                    <IoAddCircleOutline className=" text-2xl cursor-pointer" />
                </div>
            </div>
        </li>
    );
}
