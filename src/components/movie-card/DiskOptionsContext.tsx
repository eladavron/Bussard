'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getDiskOptions } from '@/src/lib/diskOptions';

interface DiskOptionsContextType {
  allFormats: string[];
  allRegions: string[];
  loading: boolean;
}

const DiskOptionsContext = createContext<DiskOptionsContextType | undefined>(undefined);

export function useDiskOptions() {
  const context = useContext(DiskOptionsContext);
  if (!context) {
    throw new Error('useDiskOptions must be used within a DiskOptionsProvider');
  }
  return context;
}

export function DiskOptionsProvider({ children }: { children: ReactNode }) {
  const [allFormats, setAllFormats] = useState<string[]>([]);
  const [allRegions, setAllRegions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDiskOptions().then(({ formats, regions }) => {
      setAllFormats(formats);
      setAllRegions(regions);
      setLoading(false);
    });
  }, []);

  return (
    <DiskOptionsContext.Provider value={{ allFormats, allRegions, loading }}>
      {children}
    </DiskOptionsContext.Provider>
  );
}
