'use client';

import { IoTrashBinOutline } from 'react-icons/io5';
import YesNoModal from '../modals/YesNoModal';
import { useState } from 'react';
import { Movie } from '../../types/movie';
import DiskView from './DiskView';
import MoviePoster from './MoviePoster';
import { Tooltip } from '@heroui/react';
import { deleteMovie } from '@/src/app/actions/movies';
import { FiEdit3 } from 'react-icons/fi';
import EditModal from '../modals/EditModal';

export interface MovieCardProps {
    movie: Movie;
    onRefresh: () => void;
}

export default function MovieCard({ movie, onRefresh }: MovieCardProps) {
    const [isYesNoModalOpen, setYesNoModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);

    return (
        <article key={movie.id} className="movie-card relative group">
            <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-2">
                    <h2 className="movie-title">
                        {movie.title}
                    </h2>
                    <span className="tag tag-gray font-mono p-0">
                        {movie.year}
                    </span>
                </div>
                <div className="flex justify-center pb-4">
                    <MoviePoster movieId={movie.id} />
                </div>
                <div className="text-sm text-secondary mb-4 flex flex-wrap gap-2 items-center">
                    {movie.runtime_min && <span>Runtime: {movie.runtime_min} min</span>}
                    <span className="grow">
                        <DiskView movie={movie} onRefresh={onRefresh} />
                    </span>
                </div>

                <p className="text-primary text-sm line-clamp-3 mb-4">
                    {movie.description || 'No description available.'}
                </p>

                <div className="text-xs text-secondary space-y-1">
                    <p><strong className="text-primary">Director:</strong> {movie.directors.map(d => d.name).join(', ') || 'N/A'}</p>
                    <p><strong className="text-primary">Starring:</strong> {movie.actors.slice(0, 3).map(a =>
                        a.name + (a.character != null ? ` (${a.character})` : ''),
                    ).join(', ')}{movie.actors.length > 3 ? '...' : ''}</p>
                </div>
            </div>
            {<>
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <Tooltip color='foreground' content='Delete Movie' placement='top' closeDelay={0}>
                        <button
                            className="button-hover"
                            role='button'
                            title="Delete Movie"
                            onClick={() => setYesNoModalOpen(true)}
                        >
                            <IoTrashBinOutline className="hover-icon text-red-500 hover:text-red-300" />
                        </button>
                    </Tooltip>
                    <Tooltip color='foreground' content='Edit Movie' placement='top' closeDelay={0}>
                        <button className="button-hover" role='button' onClick={() => setEditModalOpen(true)} title="Edit Movie">
                            <FiEdit3 className="hover-icon text-white" />
                        </button>
                    </Tooltip>
                </div>
                <YesNoModal
                    isOpen={isYesNoModalOpen}
                    title="Delete Movie"
                    message="Are you sure you want to delete this movie?"
                    onConfirm={async () => {
                        await deleteMovie(movie.id);
                        setYesNoModalOpen(false);
                        onRefresh();
                    }}
                    onCancel={() => setYesNoModalOpen(false)}
                />
            </>
            }
            <EditModal
                movie={movie}
                isOpen={isEditModalOpen}
                setIsOpen={setEditModalOpen}
                onRefresh={onRefresh}
            />
        </article>
    );
}