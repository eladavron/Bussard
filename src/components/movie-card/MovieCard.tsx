'use client';

import { Movie } from "../../types/movie";
import DiskSpan from "./DiskSpan";
import MoviePoster from "./MoviePoster";

export default function MovieCard( movie: Movie ) {
    return (
        < article key={movie.id} className="movie-card" >
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
                <div className="text-sm text-secondary mb-4 flex gap-2 items-center">
                    <span>{movie.runtime_min} min</span>
                    <span>•</span>
                    <span className="grow">
                        <DiskSpan {...movie} />
                    </span>
                </div>

                <p className="text-primary text-sm line-clamp-3 mb-4">
                    {movie.description || 'No description available.'}
                </p>

                <div className="text-xs text-secondary space-y-1">
                    <p><strong className="text-primary">Director:</strong> {movie.directors.map(d => d.name).join(', ') || 'N/A'}</p>
                    <p><strong className="text-primary">Starring:</strong> {movie.actors.slice(0, 3).map(a =>
                         a.name + (a.character != null ? ` (${a.character})` : '')
                    ).join(', ')}{movie.actors.length > 3 ? '...' : ''}</p>
                </div>
            </div>
        </article >
    );
}