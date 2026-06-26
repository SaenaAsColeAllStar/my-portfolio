import type { ICacheProvider } from "../../types/platform";
import { telemetry } from "../observability/observability-platform";

interface CacheEntry<T> {
  value: T;
  expiresAt: number | null;
  namespace?: string;
}

/**
 * Edge-Native In-Memory Cache Provider.
 * Implements ICacheProvider using a high-performance in-memory Map.
 * Features built-in TTL expirations, namespaces, and key-invalidation wildcards.
 */
export class MemoryCacheProvider implements ICacheProvider {
  private store = new Map<string, CacheEntry<any>>();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    
    if (!entry) {
      return null;
    }

    // Check expiration
    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      telemetry.debug(`Cache expired: ${key}`);
      this.store.delete(key);
      return null;
    }

    telemetry.debug(`Cache hit: ${key}`);
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    
    // Auto-detect namespace by splitting prefix (e.g. "cms:projects" -> namespace "cms")
    const namespace = key.includes(":") ? key.split(":")[0] : undefined;

    this.store.set(key, {
      value,
      expiresAt,
      namespace,
    });

    telemetry.debug(`Cache set: ${key} | TTL: ${ttlSeconds ?? "infinite"}s | Namespace: ${namespace ?? "none"}`);
  }

  async invalidate(key: string): Promise<void> {
    this.store.delete(key);
    telemetry.debug(`Cache invalidated: ${key}`);
  }

  async invalidateNamespace(ns: string): Promise<void> {
    let count = 0;
    
    for (const [key, entry] of this.store.entries()) {
      if (entry.namespace === ns || key.startsWith(`${ns}:`)) {
        this.store.delete(key);
        count++;
      }
    }

    telemetry.info(`Cache namespace [${ns}] invalidated. Cleared ${count} keys.`);
  }
}

export const memoryCache = new MemoryCacheProvider();
export default memoryCache;
