'use client';

import { createContext, useEffect, useState } from 'react';
import { getOptions } from '@/src/lib/options';

export const OptionsContext = createContext<
    {
        allFormats: string[];
        allRegions: string[];
        isScanningSupported?: boolean;
    } | undefined
>(undefined);

export function OptionsProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<{
        allFormats: string[];
        allRegions: string[];
        isScanningSupported?: boolean;
    }>({ allFormats: [], allRegions: [], isScanningSupported: false });

    useEffect(() => {
        getOptions().then(({ formats, regions, scanningSupported }) =>
            setState({ allFormats: formats, allRegions: regions, isScanningSupported: scanningSupported }),
        );
    }, []);

    return (
        <OptionsContext.Provider value={state}>
            {children}
        </OptionsContext.Provider>
    );
}
