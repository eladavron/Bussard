export const IMDBPattern = /^tt\d{7,8}$/;

export type OMDBResult = {
    Search: OMDBMovieExtended[];
    totalResults: string;
    Response: string;
}

export type OMDBMovieBasic = {
    Title: string;
    Year: string;
    imdbID: string;
    Type: string;
    Poster: string;
}

export type OMDBMovieExtended = OMDBMovieBasic & {
    Plot: string;
    Rated: string;
    Released: string;
    Runtime: string;
    Director: string;
    Writer: string;
    Actors: string;
    Poster: string;
}