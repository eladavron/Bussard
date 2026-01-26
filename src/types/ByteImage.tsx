export interface ByteImage {
  id: string;
  mime_type: string; //TODO: Make enum
  width: number;
  height: number;
  byte_size: number;
  byte_data: Uint8Array;
}