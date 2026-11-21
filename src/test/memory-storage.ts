/**
 * An in-memory Storage for specs. Provide it as BROWSER_STORAGE to test
 * persistence without touching the real localStorage, or to prove a service
 * reads and writes through the token rather than the global.
 */
export function createMemoryStorage(initial: Record<string, string> = {}): Storage {
  const entries = new Map(Object.entries(initial));
  return {
    get length() {
      return entries.size;
    },
    clear: () => entries.clear(),
    getItem: (key) => entries.get(key) ?? null,
    key: (index) => [...entries.keys()][index] ?? null,
    removeItem: (key) => void entries.delete(key),
    setItem: (key, value) => void entries.set(key, String(value)),
  };
}
