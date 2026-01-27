import { db } from '../lib/db';
import { Movie } from '../types/movie';
import ErrorPage from '../components/ErrorPage';
import Image from 'next/image';
import MovieImageUpload from '../components/MovieImageUpload'
import { DBImage } from '../types/db_image';

async function getImage(id: string){
  //Get image
  let image = await db<DBImage[]>`SELECT * FROM images WHERE id IN (SELECT poster_image_id FROM movies WHERE id = ${id}) LIMIT 1`;
  let placeholder = false;
  if(image.length > 0){
    //If exists, convert to base64 and return
    let img = image[0];

    let width = 200;
    let height = Math.floor((img.height / img.width) * width);

    let base64String = Buffer.from(img.byte_data).toString('base64');
    var src = `data:${img.mime_type};base64,${base64String}`;
    placeholder = false;
  }
  else {
     var src = "/movie_poster.jpg";
     placeholder = true;
  }

  //If it does't exist, use placeholder and uploader.

  return (
    <MovieImageUpload movieId={id} replace={!placeholder}>
      <Image src={src} alt="Poster Placeholder" width={300} height={450}/>
    </MovieImageUpload>
  );
}

export default async function Home() {
  // Check if data is initialized
  const isInitialized = (await db`SELECT to_regclass('public.movie_overview') IS NOT NULL AS exists`)[0].exists;
  if (!isInitialized) {
    return (
      <ErrorPage title="Database is not initialized!" message="The view 'movie_overview' is not initialized!" />
    );
  }

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
                <div className="flex justify-center pb-4">

                    {getImage(movie.id)}

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
