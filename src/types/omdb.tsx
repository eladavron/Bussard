export const IMDBPattern = /^tt\d{7,8}$/;

export type OMDBResult = {
    Search: OMDBMovie[];
    totalResults: string;
    Response: string;
}

export type OMDBMovie = {
    Title: string;
    Year: string;
    imdbID: string;
    Type: string;
    Poster: string;
}