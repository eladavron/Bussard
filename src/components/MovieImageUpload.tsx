'use client';

import { useState } from 'react';
import { uploadMovieImage } from '../app/actions';

interface MovieImageUploadProps {
    movieId: string;
    replace: boolean;
    children: React.ReactNode;
}

export default function MovieImageUpload({ movieId, replace, children }: MovieImageUploadProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <div
                className="relative group cursor-pointer"
                onClick={() => setIsOpen(true)}
                title="Click to upload image"
            >
                {children}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                    <span className="text-white font-semibold bg-black/50 px-3 py-1 rounded backdrop-blur-sm">
                        {replace ? 'Replace' : 'Upload'} Image
                    </span>
                </div>
            </div>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
                    <div
                        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>

                        <h2 className="text-xl font-bold mb-4 text-gray-900">{replace ? 'Replace' : 'Upload'} Movie Poster</h2>

                        <form action={async (formData) => {
                            await uploadMovieImage(movieId, formData);
                            setIsOpen(false);
                        }}>
                            <input type="hidden" name="movieId" value={movieId} />

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {replace ? 'Replace' : 'Select'} Image
                                </label>
                                <input
                                    type="file"
                                    name="image"
                                    accept="image/*"
                                    required
                                    className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                                />
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                                >
                                    Upload
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
