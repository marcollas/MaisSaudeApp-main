import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_TIMEOUT_MS = 10000;

export async function apiGet(url, { timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json;
  } finally {
    clearTimeout(timeout);
  }
}

// Simple cache helpers with TTL
export async function cacheSet(key, data, ttlMs) {
  const entry = { data, expiresAt: Date.now() + ttlMs };
  await AsyncStorage.setItem(key, JSON.stringify(entry));
}

export async function cacheGet(key) {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return null;
  try {
    const entry = JSON.parse(raw);
    if (entry && typeof entry.expiresAt === 'number' && entry.expiresAt > Date.now()) {
      return entry.data;
    }
  } catch {}
  return null;
}
