export interface Movie {
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