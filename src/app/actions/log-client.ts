'use server';

import pino from 'pino';

const streams: pino.StreamEntry[] = [
    { stream: process.stdout },
    { stream: pino.destination('logs/bussard.log') },
];

const logger = pino({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
}, pino.multistream(streams));


export async function info(message: string, meta?: object) {
    return logger.info({ source: 'client', ...meta }, message);
}

export async function warn(message: string, meta?: object) {
    return logger.warn({ source: 'client', ...meta }, message);
}

export async function error(message: string, meta?: object) {
    return logger.error({ source: 'client', ...meta }, message);
}

export async function debug(message: string, meta?: object) {
    return logger.debug({ source: 'client', ...meta }, message);
}