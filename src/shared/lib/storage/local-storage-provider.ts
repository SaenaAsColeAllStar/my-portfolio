import type { IStorageProvider } from "../../types/platform";
import { telemetry } from "../observability/observability-platform";

interface StorageWrapper {
  value: string;
  expiresAt: number | null;
}

/**
 * Browser-Safe LocalStorage Provider.
 * Implements IStorageProvider using standard browser localStorage.
 * Features SSR-safe check boundaries and basic TTL wrapping.
 */
export class LocalStorageProvider implements IStorageProvider {
  private isBrowser = typeof window !== "undefined";

  async get(key: string): Promise<string | null> {
    if (!this.isBrowser) {
      return null;
    }

    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;

      const wrapper = JSON.parse(raw) as StorageWrapper;
      
      // Check TTL expiration
      if (wrapper.expiresAt !== null && Date.now() > wrapper.expiresAt) {
        telemetry.debug(`LocalStorage item expired: ${key}`);
        localStorage.removeItem(key);
        return null;
      }

      return wrapper.value;
    } catch (e) {
      telemetry.error(`Failed to parse LocalStorage key [${key}]`, e);
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (!this.isBrowser) {
      return;
    }

    try {
      const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
      const wrapper: StorageWrapper = {
        value,
        expiresAt,
      };

      localStorage.setItem(key, JSON.stringify(wrapper));
      telemetry.debug(`LocalStorage set: ${key} | TTL: ${ttlSeconds ?? "infinite"}s`);
    } catch (e) {
      telemetry.error(`Failed to set LocalStorage key [${key}]`, e);
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.isBrowser) {
      return;
    }
    localStorage.removeItem(key);
    telemetry.debug(`LocalStorage deleted: ${key}`);
  }

  async clear(): Promise<void> {
    if (!this.isBrowser) {
      return;
    }
    localStorage.clear();
    telemetry.info("LocalStorage cleared completely");
  }
}

export const localStorageProvider = new LocalStorageProvider();
export default localStorageProvider;
