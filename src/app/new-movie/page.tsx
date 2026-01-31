'use client';

import { addMovie } from "../actions/movies";

export default function NewMoviePage() {
    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const movieData = {
            title: formData.get('title') as string,
            description: formData.get('description') as string | null,
            year: formData.get('year') ? Number(formData.get('year')) : null,
            runtime_min: formData.get('runtime_min') ? Number(formData.get('runtime_min')) : null,
            imdb_id: null,
            directors: [],
            actors: [],
            writers: []
        };
        addMovie(movieData).then(() => {
            // Optionally, redirect or update UI after adding the movie
        });
    }
    return (
        <main className="main-page">
            <div className="max-w-7xl mx-auto">
                <header className="main-header">
                    <h1 className="">Add New Movie</h1>
                </header>

                <div className="p-6 bg-secondary/10 rounded-lg border border-secondary/20">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <label htmlFor="title" className="font-medium">Title</label>
                            <input type="text" id="title" name="title" required className="input-field" />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label htmlFor="year" className="font-medium">Year</label>
                            <input type="number" id="year" name="year" required className="input-field" />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label htmlFor="description" className="font-medium">Description</label>
                            <textarea id="description" name="description" rows={4} className="input-field"></textarea>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label htmlFor="runtime_min" className="font-medium">Runtime (minutes)</label>
                            <input type="number" id="runtime_min" name="runtime_min" required className="input-field" />
                        </div>

                        <button type="submit" className="btn btn-primary mt-4">Add Movie</button>
                    </form>
                </div>
            </div>
        </main>
    );
}