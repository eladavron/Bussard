'use server';

import logger from '../../lib/logger';

export async function logClientEvent(level: 'info' | 'warn' | 'error', message: string, meta?: object) {
    // Log using Pino
    logger[level](meta || {}, message);
    return;
}