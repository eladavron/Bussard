'use server';

let formats: string[] = [];
let regions: string[] = [];
let loaded = false;

export async function loadDiskOptions() {
  if (loaded) return;
  const { getAllFormats, getAllRegions } = await import("@/src/app/actions/disks");
  [formats, regions] = await Promise.all([getAllFormats(), getAllRegions()]);
  loaded = true;
}

export async function getDiskOptions() {
  return { formats, regions };
}