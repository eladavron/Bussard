import { db } from '@/src/lib/db';
import { ByteImage } from '@/src/types/ByteImage';
import React from 'react';

interface ByteImageCompProps extends React.ImgHTMLAttributes<HTMLImageElement> {
   id: string;
}



export default async function ByteImageComp({id, ...props }: ByteImageCompProps) {
  let images = await db<ByteImage[]>`SELECT * FROM images WHERE id = ${id}`;
  if (images.length === 0) {
    console.error(`No images found for id: ${id}`)
    return null; //TODO: Return Placeholder
  }
  if (images.length > 1) {
    //TODO: Return Error ?
  }
  let image = images[0];

  const src = `data:${image.mime_type};base64,${Buffer.from(image.byte_data).toString('base64')}`;
  return <img src={src} {...props} />;
}
