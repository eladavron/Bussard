import pino from 'pino';

const streams: pino.StreamEntry[] = [
    { stream: process.stdout },
    { stream: pino.destination('logs/bussard.log') },
];

const logger = pino({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
}, pino.multistream(streams));

export const serverLogger = {
    info: async (message: string, meta?: object) => logger.info({ source: 'server', ...meta }, message),
    warn: async (message: string, meta?: object) => logger.warn({ source: 'server', ...meta }, message),
    error: async (message: string, meta?: object) => logger.error({ source: 'server', ...meta }, message),
    debug: async (message: string, meta?: object) => logger.debug({ source: 'server', ...meta }, message),
};
