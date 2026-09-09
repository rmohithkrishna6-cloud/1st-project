interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/**
 * High-performance in-memory TTL (Time-To-Live) cache with automatic expiration
 * and maximum capacity bounds to prevent memory leak/DoS attacks.
 */
export class TtlCache<K, V> {
  private cache = new Map<K, CacheEntry<V>>();
  private ttlMs: number;
  private maxItems: number;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(ttlMs: number = 60 * 60 * 1000, maxItems: number = 10000) {
    this.ttlMs = ttlMs;
    this.maxItems = maxItems;

    // Background cleanup of expired items
    this.cleanupInterval = setInterval(() => this.purgeExpired(), 5 * 60 * 1000);
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  set(key: K, value: V, customTtlMs?: number): void {
    const now = Date.now();
    const ttl = customTtlMs ?? this.ttlMs;

    // Capacity bound: purge expired or drop oldest item
    if (this.cache.size >= this.maxItems) {
      this.purgeExpired();
      if (this.cache.size >= this.maxItems) {
        const oldestKey = this.cache.keys().next().value;
        if (oldestKey !== undefined) {
          this.cache.delete(oldestKey);
        }
      }
    }

    this.cache.set(key, {
      value,
      expiresAt: now + ttl,
    });
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value;
  }

  has(key: K): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  get size(): number {
    return this.cache.size;
  }

  purgeExpired(): number {
    const now = Date.now();
    let count = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        count++;
      }
    }
    return count;
  }

  clear(): void {
    this.cache.clear();
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
  }
}
