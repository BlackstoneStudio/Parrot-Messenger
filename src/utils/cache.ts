interface CacheEntry<T> {
  value: T;
  expires: number;
}

// eslint-disable-next-line import/prefer-default-export
export class SimpleCache<T> {
  private cache = new Map<string, CacheEntry<T>>();

  private defaultTTL: number;

  constructor(defaultTTLMs: number = 300000) {
    // Default 5 minutes
    this.defaultTTL = defaultTTLMs;
  }

  set(key: string, value: T, ttlMs?: number): void {
    const ttl = ttlMs ?? this.defaultTTL;
    this.cache.set(key, {
      value,
      expires: Date.now() + ttl,
    });
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      return undefined;
    }

    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value;
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    Array.from(this.cache.entries()).forEach(([key, entry]) => {
      if (now > entry.expires) {
        this.cache.delete(key);
      }
    });
  }

  size(): number {
    this.cleanup();
    return this.cache.size;
  }
}
