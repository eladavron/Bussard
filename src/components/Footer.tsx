'use client';

import { addMovie, MovieInput } from "../app/actions/movies";
import { clearMetadata } from "../app/actions/debug";
import { addDisk } from "../app/actions/disks";

export default function Footer() {
  return (
    <footer>
      <div className="mt-10 text-center text-sm text-secondary">
        <span>&copy; {new Date().getFullYear()} My Movie Collection</span>
      </div>
      <div>
        <h2>Debug</h2>
        <div className="mb-4 flex flex-row gap-2">
          <button className="button-primary"
            onClick={async () => {
              let newMovie: MovieInput = {
                title: "Test Movie",
                description: "This is a test movie",
                year: 2024,
                runtime_min: 120,
                imdb_id: null,
                directors: ["Director One", "Director Two"],
                actors: [
                  { name: "Actor One", character: "Character A" },
                  { name: "Actor Two", character: "Character B" }
                ],
                writers: ["Writer One"],
                poster_image_url: "https://i.imgur.com/sm3qZl3.jpeg"
              }
              let movie_id = await addMovie(newMovie);
              await addDisk(movie_id, "Blu-Ray", "Region A");
              window.location.reload();
            }}
          >ADD</button>
          <button className="button-danger"
            onClick={async () => {
              await clearMetadata();
              window.location.reload();
            }
            }
          >CLEAR</button>
        </div>
      </div>
    </footer>
  );
}
