'use server';

import { db } from './db';

export async function getOptions(): Promise<{
    formats: string[];
    regions: string[];
    scanningSupported: boolean;
}> {
    const formatResults = await db<{ name: string }[]>`SELECT name FROM formats ORDER BY sort_order`;
    const regionResults = await db<{ name: string }[]>`SELECT name FROM regions`;
    const scanningSupported = !!process.env.BARCODE_LOOKUP_API_KEY;

    return {
        formats: formatResults.map(f => f.name),
        regions: regionResults.map(r => r.name),
        scanningSupported,
    };
}