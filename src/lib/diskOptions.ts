'use server';

import { db } from './db';

export async function getDiskOptions() {
    const formatResults = await db<{ name: string }[]>`SELECT name FROM formats ORDER BY sort_order`;
    const regionResults = await db<{ name: string }[]>`SELECT name FROM regions`;
    return {
        formats: formatResults.map(f => f.name),
        regions: regionResults.map(r => r.name),
    };
}