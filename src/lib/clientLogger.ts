// Client-side logger that calls server logging functions via API routes or direct import (for SSR)
import * as logFns from '@/src/app/actions/log-client';

export const clientLogger = {
    info: logFns.info,
    warn: logFns.warn,
    error: logFns.error,
    debug: logFns.debug,
};
