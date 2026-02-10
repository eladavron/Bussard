'use client';

import BaseModal from './BaseModal';
import { Form, Input, Textarea } from '@heroui/react';
import { Movie } from '@/src/types/movie';
import { useRef, useState } from 'react';
import YesNoModal from './YesNoModal';
import MoviePoster from '../movie-card/MoviePoster';
import { editMovie } from '@/src/app/actions/movies';

interface EditModalProps {
    movie: Movie,
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onRefresh: () => void;
}

export default function EditModal({ movie, isOpen, setIsOpen, onRefresh }: EditModalProps) {

    const originalMovie = useRef<Movie>(movie);
    const [movieState, setMovieState] = useState<Movie>(movie);
    const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);

    const handleChange = (field: keyof Movie, value: string | number | undefined) => {
        setMovieState(prev => ({ ...prev, [field]: value }));
    };

    const isDirty = JSON.stringify(movieState) !== JSON.stringify(originalMovie.current);

    return (<>
        <BaseModal
            title={
                <div className="flex items-center gap-2">
                    <span>Edit Movie</span>
                </div>
            }
            isOpen={isOpen}
            className="max-w-1/2"
            onClose={() => setIsOpen(false)}
            body={(
                <>
                    <Form
                        id="edit-form"
                        className="flex flex-col gap-4 items-center"
                        onSubmit={async (e) => {
                            e.preventDefault();
                            await editMovie(movieState);
                            await onRefresh();
                            setIsOpen(false);
                        }}
                    >
                            <MoviePoster
                                movieId={movieState.id}
                            />
                        <div className="flex gap-2 w-full">
                            <Input
                                label="Title"
                                className="grow"
                                value={movieState.title}
                                onChange={(e) => handleChange('title', e.target.value)}
                                required
                            />
                            <Input
                                label="Year"
                                type="number"
                                className="w-auto"
                                value={movieState.year?.toString() || ''}
                                onChange={(e) => handleChange('year', parseInt(e.target.value) || undefined)}
                            />
                            <Input
                                label="IMDB ID"
                                className='w-auto'
                                classNames={{
                                    input: ['font-mono'],
                                }}
                                value={movieState.imdb_id || ''}
                                isInvalid={movieState.imdb_id ? !/^tt\d{7,}$/.test(movieState.imdb_id) : false}
                                onChange={(e) => handleChange('imdb_id', e.target.value)}
                            />
                        </div>
                        <div className="w-full">
                            <Textarea className="w-full" label="Description" value={movieState.description || ''} onChange={(e) => handleChange('description', e.target.value)} />
                        </div>
                    </Form>
                </>
            )}
            footer={(
                <div className="flex justify-end gap-2">
                    <button className="button-secondary" onClick={() => {
                        {
                            if (isDirty) {
                                setIsDiscardModalOpen(true);
                            } else {
                                setIsOpen(false);
                            }
                        }
                    }}>
                        Cancel
                    </button>
                    <button className={`button-primary ${isDirty ? '' : 'disabled'}`} type="submit" form="edit-form" disabled={!isDirty}>
                        Save
                    </button>
                </div>
            )}
        />
        <YesNoModal
            isOpen={isDiscardModalOpen}
            title="Discard Changes"
            onConfirm={() => {
                setMovieState(originalMovie.current);
                setIsDiscardModalOpen(false);
                setIsOpen(false);
            }}
            onCancel={() => setIsDiscardModalOpen(false)}
            message="You have unsaved changes. Are you sure you want to discard them?"
        />
    </>
    )
}