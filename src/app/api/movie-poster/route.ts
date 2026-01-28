import { db } from '@/src/lib/db';
import { DBImage } from '@/src/types/db_image';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const movieId = request.nextUrl.searchParams.get('id');

    if (!movieId) {
        return NextResponse.json({ error: 'Movie ID required' }, { status: 400 });
    }

    try {
        const image = await db<DBImage[]>`SELECT * FROM images WHERE id IN (SELECT poster_image_id FROM movies WHERE id = ${movieId}) LIMIT 1`;

        let width = 200;
        let height = 300;
        let src = "/movie_poster.jpg";
        let isPlaceholder = true;

        if (image.length > 0) {
            const img = image[0];
            height = Math.floor((img.height / img.width) * width);
            const base64String = Buffer.from(img.byte_data).toString('base64');
            src = `data:${img.mime_type};base64,${base64String}`;
            isPlaceholder = false;
        }

        return NextResponse.json({ src, isPlaceholder, width, height });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 });
    }
}