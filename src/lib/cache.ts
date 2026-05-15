import { Notice } from "./types";

interface CacheEntry {
  data: Notice[];
  fetchedAt: string;
  timestamp: number;
}

const CACHE_TTL_MS = 10 * 60 * 1000; // 10분

const store = new Map<string, CacheEntry>();

export function getCache(key: string): CacheEntry | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    store.delete(key);
    return null;
  }
  return entry;
}

export function setCache(key: string, data: Notice[], fetchedAt: string): void {
  store.set(key, { data, fetchedAt, timestamp: Date.now() });
}
