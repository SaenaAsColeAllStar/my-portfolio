import type { IHttpClient, HttpRequestConfig, HttpResponse } from "../../types/platform";

/**
 * Fluent HTTP Request Builder.
 * Simplifies compiling, configuring, and executing type-safe requests
 * with custom headers, query parameters, timeouts, and retry parameters.
 */
export class RequestBuilder<T = any> {
  private config: HttpRequestConfig = {
    method: "GET",
    headers: {},
    params: {},
  };

  constructor(private client: IHttpClient, private url: string) {}

  /**
   * Set HTTP Method.
   */
  method(method: Required<HttpRequestConfig>["method"]): this {
    this.config.method = method;
    return this;
  }

  /**
   * Add multiple headers.
   */
  headers(headers: Record<string, string>): this {
    this.config.headers = {
      ...this.config.headers,
      ...headers,
    };
    return this;
  }

  /**
   * Add a single header.
   */
  header(key: string, value: string): this {
    this.config.headers = {
      ...this.config.headers,
      [key]: value,
    };
    return this;
  }

  /**
   * Add multiple query parameters.
   */
  params(params: Record<string, string | number | boolean>): this {
    this.config.params = {
      ...this.config.params,
      ...params,
    };
    return this;
  }

  /**
   * Add a single query parameter.
   */
  param(key: string, value: string | number | boolean): this {
    this.config.params = {
      ...this.config.params,
      [key]: value,
    };
    return this;
  }

  /**
   * Set request payload body.
   */
  body(body: any): this {
    this.config.body = body;
    return this;
  }

  /**
   * Set request-specific timeout in milliseconds.
   */
  timeout(timeoutMs: number): this {
    this.config.timeout = timeoutMs;
    return this;
  }

  /**
   * Override retry counts.
   */
  retries(count: number): this {
    this.config.retryCount = count;
    return this;
  }

  /**
   * Bind request cancellation signal.
   */
  signal(signal: AbortSignal): this {
    this.config.signal = signal;
    return this;
  }

  /**
   * Executes the HTTP request and returns the parsed type-safe response.
   */
  async execute(): Promise<HttpResponse<T>> {
    return this.client.request<T>(this.url, this.config);
  }

  /**
   * Shorthand to directly execute and return only the response data.
   */
  async executeData(): Promise<T> {
    const response = await this.execute();
    return response.data;
  }
}

export default RequestBuilder;
