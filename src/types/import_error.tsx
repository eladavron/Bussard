export interface ImportError {
    message: string;
    index: number;
    row: Record<string, string>;
}