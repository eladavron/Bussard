import { Movie } from '../types/movie';

export enum SortBy {
    TITLE,
    YEAR,
}

export enum SortOrder {
    ASC,
    DESC,
}

export interface SortOption{
    sortBy: SortBy;
    sortOrder: SortOrder;
    ignoreArticles: boolean;
}

export function sortMovies(movies: Movie[], option: SortOption): Movie[] {
    const sortedMovies = [...movies].sort((a, b) => {
        let aValue: string | number = '';
        let bValue: string | number = '';

        switch (option.sortBy) {
            case SortBy.TITLE:
                aValue = option.ignoreArticles ? a.title.replace(/^(a|an|the)\s+/i, '') : a.title;
                bValue = option.ignoreArticles ? b.title.replace(/^(a|an|the)\s+/i, '') : b.title;
                return option.sortOrder === SortOrder.ASC
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            case SortBy.YEAR:
                aValue = a.year || 0;
                bValue = b.year || 0;
                return option.sortOrder === SortOrder.ASC
                    ? (aValue as number) - (bValue as number)
                    : (bValue as number) - (aValue as number);
            default:
                return 0;
        }
    });

    return sortedMovies;
}
