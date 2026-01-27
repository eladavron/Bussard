export interface DBImage {
    id: string;
    mime_type: string;
    width: number;
    height: number;
    byte_size: number;
    byte_data: Buffer;
};