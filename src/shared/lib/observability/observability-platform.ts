import { appConfig } from "../../config/app-config";
import type { IObservability, TelemetryEvent } from "../../types/platform";

/**
 * Vendor-Agnostic Observability Platform.
 * Implements the IObservability contract to handle logging, telemetry tracking,
 * performance metrics, and span tracing under a unified, edge-safe API.
 */
class ObservabilityPlatform implements IObservability {
  private isDev = process.env.NODE_ENV !== "production";
  private logLevel = appConfig.observability.logLevel;

  private shouldLog(level: "debug" | "info" | "warn" | "error"): boolean {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    const currentBound = levels[this.logLevel as "debug" | "info" | "warn" | "error"] ?? 0;
    return levels[level] >= currentBound;
  }

  private format(level: string, message: string, meta?: Record<string, any>): string {
    const timestamp = new Date().toISOString();
    const metaString = meta && Object.keys(meta).length > 0
      ? ` | Meta: ${JSON.stringify(meta)}`
      : "";
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaString}`;
  }

  info(message: string, meta?: Record<string, any>): void {
    if (this.shouldLog("info")) {
      console.log(this.format("info", message, meta));
    }
  }

  warn(message: string, meta?: Record<string, any>): void {
    if (this.shouldLog("warn")) {
      console.warn(this.format("warn", message, meta));
    }
  }

  error(message: string, error?: any, meta?: Record<string, any>): void {
    if (this.shouldLog("error")) {
      const errorDetails = error instanceof Error
        ? { name: error.name, message: error.message, stack: error.stack }
        : { rawError: error };

      console.error(
        this.format("error", message, {
          ...errorDetails,
          ...meta,
        })
      );
    }
  }

  debug(message: string, meta?: Record<string, any>): void {
    if (this.isDev && this.shouldLog("debug")) {
      console.log(this.format("debug", message, meta));
    }
  }

  trackEvent(event: TelemetryEvent): void {
    this.info(`[TELEMETRY-EVENT] [${event.category.toUpperCase()}] ${event.name}`, event.metadata);
    
    // Future extension point: Send event beacon to Cloudflare Analytics
    // if (appConfig.observability.enableMetrics) {
    //   fetch('/api/telemetry/event', { method: 'POST', body: JSON.stringify(event) }).catch(() => {});
    // }
  }

  trackMetric(name: string, value: number, tags?: Record<string, string>): void {
    this.debug(`[METRIC] ${name}: ${value}`, tags);
    
    // Future extension point: Send metric to edge metrics counter
  }

  startSpan(name: string): { end: () => void } {
    const start = performance.now();
    this.debug(`[SPAN-START] ${name}`);

    return {
      end: () => {
        const duration = performance.now() - start;
        this.debug(`[SPAN-END] ${name} | Duration: ${duration.toFixed(2)}ms`);
        this.trackMetric(`span.duration.${name}`, duration);
      },
    };
  }
}

export const telemetry = new ObservabilityPlatform();
export default telemetry;
