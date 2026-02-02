'use client';

import { useEffect, useState } from 'react';
import { addMovieImageFromURL, deleteImage, uploadMovieImage } from '../app/actions/images';
import UploadModal from './modals/UploadModal';

import { IoTrashBinOutline } from "react-icons/io5";
import { FiEdit3 } from "react-icons/fi";
import YesNoModal from './modals/YesNoModal';

interface MoviePosterProps {
    movieId: string;
}

interface MoviePosterMeta {
    src: string;
    isPlaceholder: boolean;
    height?: number;
    width?: number;
}

export default function MoviePoster({ movieId }: MoviePosterProps) {
    const [isUploadModalOpen, setUploadModalOpen] = useState(false);
    const [isYesNoModalOpen, setYesNoModalOpen] = useState(false);
    const [imageMeta, setImageMeta] = useState<MoviePosterMeta | null>(null);
    const [loading, setLoading] = useState(true);

    async function loadImage() {
        try {
            const response = await fetch(`/api/movie-poster?id=${movieId}`);
            const data = await response.json();
            setImageMeta(data);
        } catch (error) {
            console.error('Failed to load image:', error);
            setImageMeta({ src: '/movie_poster.jpg', isPlaceholder: true, width: 200, height: 300 });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { loadImage(); }, [movieId]);

    if (loading || !imageMeta) {
        return <div className="movie-poster" />;
    }

    return (
        <>
            {imageMeta.isPlaceholder && (
                <div className="relative group" onClick={() => setUploadModalOpen(true)} title="Click to upload image">
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded cursor-pointer">
                        <span className="text-white font-semibold bg-black/50 px-3 py-1 rounded backdrop-blur-sm">
                            Upload Image
                        </span>
                    </div>
                    <img src={imageMeta.src} alt="Movie Poster" className='movie-poster' />
                </div>
            )}
            {!imageMeta.isPlaceholder && (
                <div className="relative group">
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-2 items-end">
                        <button className="button-hover" role='button' title="Delete Image">
                            <IoTrashBinOutline className="text-white w-full h-full" onClick={async () => setYesNoModalOpen(true)} />
                        </button>
                        <button className="button-hover" role='button' onClick={() => setUploadModalOpen(true)} title="Edit Image">
                            <FiEdit3 className="text-white w-full h-full" />
                        </button>
                    </div>
                    <img src={imageMeta.src} alt="Movie Poster" className='movie-poster' />
                </div>
            )}
            <UploadModal
                title="Upload Movie Poster"
                message="Select an image to upload as the movie poster."
                isOpen={isUploadModalOpen}
                onUpload={async (formData) => {
                    await uploadMovieImage(movieId, formData);
                    // Reload image after upload
                    const response = await fetch(`/api/movie-poster?id=${movieId}`);
                    const data = await response.json();
                    setImageMeta(data);
                }}
                onURL={async (url) => {
                    await addMovieImageFromURL(movieId, url);
                    // Reload image after upload
                    const response = await fetch(`/api/movie-poster?id=${movieId}`);
                    const data = await response.json();
                    setImageMeta(data);
                }}
                onClose={() => setUploadModalOpen(false)}
            />
            <YesNoModal
                isOpen={isYesNoModalOpen}
                title="Delete Image"
                message="Are you sure you want to delete this image?"
                onConfirm={async () => {
                    await deleteImage(movieId);
                    setImageMeta({ src: '/movie_poster.jpg', isPlaceholder: true, width: 200, height: 300 });
                    setYesNoModalOpen(false);
                }}
                onCancel={() => setYesNoModalOpen(false)}
            />
        </>
    );
}
