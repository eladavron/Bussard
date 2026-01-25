import { db } from '../lib/db';

// Define the shape of the data returned by the 'movie_overview' view
interface Movie {
  id: string;
  title: string;
  description: string | null;
  year: number | null;
  runtime_min: number | null;
  imdb_id: string | null;
  // JSON arrays returned by the view
  directors: { id: string; name: string }[];
  actors: { id: string; name: string; character: string | null }[];
  writers: { id: string; name: string }[];
  disks: {
    id: string;
    format: { id: string; name: string };
    region: { id: string; name: string };
  }[];
}

export default async function Home() {
  // Fetch data directly from the view
  const movies = await db<Movie[]>`SELECT * FROM movie_overview ORDER BY title ASC`;

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">My Collection</h1>
          <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
            {movies.length} Movies
          </span>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {movies.map((movie) => (
            <article key={movie.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-semibold text-gray-900 leading-tight">
                    {movie.title}
                  </h2>
                  <span className="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-0.5 rounded">
                    {movie.year}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-4 flex gap-2">
                  <span>{movie.runtime_min} min</span>
                  <span>•</span>
                  <span>
                    {Array.from(new Set(movie.disks.map(d => d.format.name).filter(Boolean))).join(', ') || 'No Format'}
                  </span>
                </div>

                <p className="text-gray-700 text-sm line-clamp-3 mb-4">
                  {movie.description || 'No description available.'}
                </p>

                <div className="text-xs text-gray-500 space-y-1">
                  <p><strong className="text-gray-700">Director:</strong> {movie.directors.map(d => d.name).join(', ') || 'N/A'}</p>
                  <p><strong className="text-gray-700">Starring:</strong> {movie.actors.slice(0, 3).map(a => a.name).join(', ')}{movie.actors.length > 3 ? '...' : ''}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
