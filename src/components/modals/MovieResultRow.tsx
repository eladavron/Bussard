'use client';

import { addMovie, getMovieByIMDBID, inputFromOMDB } from '@/src/app/actions/movies';
import { DoesMovieExist } from '@/src/types/movie';
import { OMDBMovieExtended } from '@/src/types/omdb';
import { Image, Skeleton } from '@heroui/react';
import { useEffect, useState } from 'react';
import { IoCheckmarkCircle } from 'react-icons/io5'; import { IoAddCircleOutline } from 'react-icons/io5';
import { CgSpinner } from 'react-icons/cg';

interface MovieResultRowProps {
    movie?: OMDBMovieExtended;
    isLoading?: boolean;
    extendedDataLoaded?: boolean;
    onAdd?: () => void;
}
export default function MovieResultRow({ movie, isLoading = false, extendedDataLoaded = false, onAdd }: MovieResultRowProps) {
    const [imageError, setImageError] = useState(false);
    const [doesMovieExist, setDoesMovieExist] = useState<DoesMovieExist>(DoesMovieExist.Loading);

    useEffect(() => {
        if (!movie?.imdbID) {
return;
}
        setDoesMovieExist(DoesMovieExist.Loading);
        getMovieByIMDBID(movie.imdbID)
            .then((movie) => movie == null ? setDoesMovieExist(DoesMovieExist.No) : setDoesMovieExist(DoesMovieExist.Yes))
            .catch(() => setDoesMovieExist(DoesMovieExist.Error));
    }, [movie?.imdbID]);

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

    if (!movie) {
        return null;
    }

    return (
        <li className="mb-2 p-2 border border-default rounded">
            <div className="flex">
                {movie.Poster !== 'N/A' && !imageError ? (
                    <Image
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
                    <div className="text-sm text-secondary flex items-center">
                        Director: {movie.Director ? movie.Director : <Skeleton className="h-4 w-20 rounded inline-block ml-2" />}
                    </div>
                    <div className='text-sm text-secondary'>
                        Actors: {movie.Actors ? movie.Actors : <Skeleton className="h-4 w-3/4 rounded" />}
                    </div>
                </div>
                <div className="flex items-center ml-4 text-primary">
                    {doesMovieExist === DoesMovieExist.No && extendedDataLoaded && <IoAddCircleOutline className="cursor-pointer" title="Add Movie" onClick={async () => {
                        //replace with spinner
                        setDoesMovieExist(DoesMovieExist.Adding);
                        await addMovie(await inputFromOMDB(movie));
                        setDoesMovieExist(DoesMovieExist.Yes);
                        onAdd?.();
                    }} />}
                    {doesMovieExist === DoesMovieExist.Yes && <IoCheckmarkCircle title="Already in Collection" />}
                    {(doesMovieExist === DoesMovieExist.Adding || doesMovieExist === DoesMovieExist.Loading) && <CgSpinner className="animate-spin" />}
                </div>
            </div>
        </li>
    );
}
