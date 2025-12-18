import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HOUR = 60 * 60 * 1000;

export function useApiQuery(key, fetcher, { ttlMs = HOUR } = {}) {
  const cacheKey = `@maisSaude:cache:${key}`;
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);

  const readCache = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(cacheKey);
      if (!raw) return null;
      const entry = JSON.parse(raw);
      if (entry?.expiresAt && entry.expiresAt > Date.now()) {
        return entry.data;
      }
    } catch {}
    return null;
  }, [cacheKey]);

  const writeCache = useCallback(async (value) => {
    try {
      const entry = { data: value, expiresAt: Date.now() + ttlMs };
      await AsyncStorage.setItem(cacheKey, JSON.stringify(entry));
    } catch {}
  }, [cacheKey, ttlMs]);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fresh = await fetcher();
      if (mountedRef.current) {
        setData(fresh);
        writeCache(fresh);
      }
    } catch (e) {
      if (mountedRef.current) setError(e);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [fetcher, writeCache]);

  useEffect(() => {
    mountedRef.current = true;
    (async () => {
      const cached = await readCache();
      if (cached) setData(cached);
      await refetch();
    })();
    return () => { mountedRef.current = false; };
  }, [readCache, refetch]);

  return { data, error, loading, refetch };
}
