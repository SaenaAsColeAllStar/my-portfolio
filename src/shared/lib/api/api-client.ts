import { FetchHttpClient } from "./fetch-http-client";
import { RequestBuilder } from "./request-builder";
import type { IHttpClient } from "../../types/platform";

/**
 * Coordinated API Client Gateway.
 * Exposes a fluent request builder interface for making clean, type-safe API requests.
 * Completely decouples the page components from raw fetch invocations.
 */
class APIClient {
  private httpClient: IHttpClient;

  constructor(client: IHttpClient = new FetchHttpClient()) {
    this.httpClient = client;
  }

  /**
   * Spawns a new fluent RequestBuilder for compiling a request.
   */
  request<T = any>(path: string): RequestBuilder<T> {
    return new RequestBuilder<T>(this.httpClient, path);
  }

  /**
   * Fluent shorthand to start a GET request.
   */
  get<T = any>(
    path: string,
    params?: Record<string, string | number | boolean>
  ): RequestBuilder<T> {
    const builder = this.request<T>(path).method("GET");
    if (params) {
      builder.params(params);
    }
    return builder;
  }

  /**
   * Fluent shorthand to start a POST request.
   */
  post<T = any>(path: string, body?: any): RequestBuilder<T> {
    const builder = this.request<T>(path).method("POST");
    if (body) {
      builder.body(body);
    }
    return builder;
  }

  /**
   * Fluent shorthand to start a PUT request.
   */
  put<T = any>(path: string, body?: any): RequestBuilder<T> {
    const builder = this.request<T>(path).method("PUT");
    if (body) {
      builder.body(body);
    }
    return builder;
  }

  /**
   * Fluent shorthand to start a DELETE request.
   */
  delete<T = any>(path: string): RequestBuilder<T> {
    return this.request<T>(path).method("DELETE");
  }
}

export const apiClient = new APIClient();
export default apiClient;
