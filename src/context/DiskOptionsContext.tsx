'use client';

import { createContext, useEffect, useState } from 'react';
import { getDiskOptions } from '@/src/lib/diskOptions';

export const DiskOptionsContext = createContext<
  { allFormats: string[]; allRegions: string[]; loading: boolean } | undefined
>(undefined);

export function DiskOptionsProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ allFormats: string[]; allRegions: string[]; loading: boolean }>({ allFormats: [], allRegions: [], loading: true });

  useEffect(() => {
    getDiskOptions().then(({ formats, regions }) =>
      setState({ allFormats: formats, allRegions: regions, loading: false }),
    );
  }, []);

  return (
    <DiskOptionsContext.Provider value={state}>
      {children}
    </DiskOptionsContext.Provider>
  );
}
