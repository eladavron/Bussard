import { db } from '../lib/db';
import { Movie } from '../types/movie';

export default async function Home() {
  // Fetch data directly from the view
  const movies = await db<Movie[]>`SELECT * FROM movie_overview ORDER BY title ASC`;

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="main-header">
          <h1 className="">My Collection</h1>
          <span className="tag tag-blue">
            {movies.length} Movies
          </span>
        </header>

        <div className="main-grid">
          {movies.map((movie) => (
            <article key={movie.id} className="movie-card">
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-semibold text-gray-900 leading-tight">
                    {movie.title}
                  </h2>
                  <span className="tag tag-gray font-mono p-0">
                    {movie.year}
                  </span>
                </div>
                <div className="text-sm text-secondary mb-4 flex gap-2">
                  <span>{movie.runtime_min} min</span>
                  <span>•</span>
                  <span>
                    {Array.from(new Set(movie.disks.map(d => d.format.name).filter(Boolean))).join(', ') || 'No Format'}
                  </span>
                </div>

                <p className="text-primary text-sm line-clamp-3 mb-4">
                  {movie.description || 'No description available.'}
                </p>

                <div className="text-xs text-secondary space-y-1">
                  <p><strong className="text-primary">Director:</strong> {movie.directors.map(d => d.name).join(', ') || 'N/A'}</p>
                  <p><strong className="text-primary">Starring:</strong> {movie.actors.slice(0, 3).map(a => a.name).join(', ')}{movie.actors.length > 3 ? '...' : ''}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
