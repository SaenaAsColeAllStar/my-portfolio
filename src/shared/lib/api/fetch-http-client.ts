import { appConfig } from "../../config/app-config";
import { APIError } from "../error/error-handler";
import { telemetry } from "../observability/observability-platform";
import type { IHttpClient, HttpRequestConfig, HttpResponse } from "../../types/platform";

/**
 * Concrete Fetch HTTP Client.
 * Implements the IHttpClient contract using edge-safe native fetch.
 * Features built-in timeout racing, exponential backoff retries, and structured error mapping.
 */
export class FetchHttpClient implements IHttpClient {
  private defaultTimeout = appConfig.api.timeoutMs;
  private retryLimit = appConfig.api.retryConfig.maxAttempts;
  private retryDelayBase = appConfig.api.retryConfig.backoffMs;

  /**
   * Performs an HTTP request with built-in retry and timeout policies.
   */
  async request<T>(url: string, config: HttpRequestConfig = {}): Promise<HttpResponse<T>> {
    const method = config.method || "GET";
    const timeout = config.timeout ?? this.defaultTimeout;
    const maxRetries = config.retryCount ?? this.retryLimit;
    
    let attempt = 0;

    const executeAttempt = async (): Promise<HttpResponse<T>> => {
      attempt++;
      const span = telemetry.startSpan(`http.${method.toLowerCase()}.${url}`);
      
      const controller = new AbortController();
      const { signal } = controller;

      // Connect input signal if provided for request cancellation
      if (config.signal) {
        config.signal.addEventListener("abort", () => controller.abort());
      }

      // 1. Timeout Racing policy
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, timeout);

      const requestHeaders = {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Cole-Client": "NextJS-Portfolio-Edge",
        ...config.headers,
      };

      try {
        const fetchUrl = this.buildUrl(url, config.params);
        
        const response = await fetch(fetchUrl, {
          method,
          headers: requestHeaders,
          body: config.body ? JSON.stringify(config.body) : undefined,
          signal,
        });

        clearTimeout(timeoutId);
        span.end();

        // If server returns a 5xx error, trigger retry policy
        if (response.status >= 500 && attempt < maxRetries) {
          telemetry.warn(`HTTP ${response.status} on ${url}. Attempt ${attempt}/${maxRetries}. Retrying...`);
          return await this.retryRequest(executeAttempt, attempt);
        }

        if (!response.ok) {
          let details = null;
          try {
            details = await response.json();
          } catch {
            // Not JSON
          }
          throw new APIError(
            `HTTP Error ${response.status}: ${response.statusText}`,
            response.status,
            details
          );
        }

        const headers: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          headers[key] = value;
        });

        const data = response.status === 204 ? ({} as T) : await response.json();

        return {
          data,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        };
      } catch (err: any) {
        clearTimeout(timeoutId);
        span.end();

        const isAbort = err.name === "AbortError" || signal.aborted;
        
        // Trigger retry on network errors (non-aborted)
        if (!isAbort && attempt < maxRetries) {
          telemetry.warn(`Network error on ${url}. Attempt ${attempt}/${maxRetries}. Retrying... | Error: ${err.message}`);
          return await this.retryRequest(executeAttempt, attempt);
        }

        if (isAbort) {
          throw new APIError(`Request timed out after ${timeout}ms`, 408);
        }

        if (err instanceof APIError) {
          throw err;
        }

        throw new APIError(`Connection failed: ${err.message || String(err)}`);
      }
    };

    return executeAttempt();
  }

  /**
   * Standard exponential backoff retry calculation.
   */
  private async retryRequest<T>(
    fn: () => Promise<HttpResponse<T>>,
    attempt: number
  ): Promise<HttpResponse<T>> {
    const delay = Math.pow(2, attempt) * this.retryDelayBase;
    await new Promise((resolve) => setTimeout(resolve, delay));
    return fn();
  }

  /**
   * Helper to compile URL query parameters safely.
   */
  private buildUrl(base: string, params?: Record<string, string | number | boolean>): string {
    if (!params || Object.keys(params).length === 0) {
      return base;
    }
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      searchParams.append(key, String(val));
    });
    const connector = base.includes("?") ? "&" : "?";
    return `${base}${connector}${searchParams.toString()}`;
  }
}

export default FetchHttpClient;
