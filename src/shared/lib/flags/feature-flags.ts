import { appConfig } from "../../config/app-config";
import type { IFeatureFlags } from "../../types/platform";

/**
 * Feature Flags Platform Service.
 * Implements the IFeatureFlags contract to manage feature gates,
 * experimental flags, and Konami Easter egg states.
 */
export class FeatureFlags implements IFeatureFlags {
  private flags = appConfig.featureFlags;

  /**
   * Checks if a specific feature flag is enabled.
   */
  isEnabled(flag: string): boolean {
    const value = (this.flags as Record<string, any>)[flag];
    return typeof value === "boolean" ? value : false;
  }

  /**
   * Retrieves the value of a feature flag with a typed fallback.
   */
  getFlagValue<T>(flag: string, defaultValue: T): T {
    const value = (this.flags as Record<string, any>)[flag];
    return value !== undefined ? (value as T) : defaultValue;
  }

  /**
   * Exports all current feature flag states.
   */
  getAllFlags(): Record<string, any> {
    return { ...this.flags };
  }
}

export const featureFlags = new FeatureFlags();
export default featureFlags;
