import { DBImage } from "./db_image";
import { Movie } from "./movie";

/* Formats and Regions are static data in the database, so no need to import them */

export interface BackupMetadata {
    Movies: Array<Movie>;
    Images: Array<DBImage>;
    People: Array<{ id: string; name: string }>;
    MovieDisks: Array<{ movie_id: string; disk_id: string }>;
    MovieActors: Array<{ movie_id: string; person_id: string; character: string | null }>;
    MovieWriters: Array<{ movie_id: string; person_id: string }>;
    MovieDirectors: Array<{ movie_id: string; person_id: string }>;
};