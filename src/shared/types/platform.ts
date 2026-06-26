/**
 * Cole.dev Platform Layer Interface Contracts.
 * Establishes the strict TypeScript boundaries for all cross-cutting infrastructure services,
 * guaranteeing 100% vendor decoupling and high testability across edge and browser environments.
 */

// ── 1. HTTP CLIENT LAYER ──
export interface HttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

export interface HttpRequestConfig {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  body?: any;
  timeout?: number;
  retryCount?: number;
  retryDelay?: number;
  signal?: AbortSignal;
}

export interface IHttpClient {
  request<T>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>>;
}

// ── 2. STORAGE LAYER ──
export interface IStorageProvider {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

// ── 3. CACHE LAYER ──
export interface ICacheProvider {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  invalidate(key: string): Promise<void>;
  invalidateNamespace(ns: string): Promise<void>;
}

// ── 4. AUTH & ROLE-BASED ACCESS LAYER ──
export type UserRole = "visitor" | "administrator" | "guest";

export interface AuthSession {
  userId: string;
  email: string;
  role: UserRole;
  token: string;
  expiresAt: string;
}

export interface IAuthService {
  getSession(): Promise<AuthSession | null>;
  loginWithOAuth(provider: "github" | "google"): Promise<void>;
  loginWithPasskey(): Promise<AuthSession>;
  logout(): Promise<void>;
  hasAccess(requiredRole: UserRole): Promise<boolean>;
}

// ── 5. CMS LAYER ──
import type { Project, Article, TimelineItem } from "./domain";

export interface ICmsService {
  getProjects(): Promise<Project[]>;
  getProject(slug: string): Promise<Project | null>;
  getArticles(): Promise<Article[]>;
  getArticle(slug: string): Promise<Article | null>;
  getTimeline(): Promise<TimelineItem[]>;
}

// ── 6. AI ASSISTANT LAYER ──
export interface ChatMessage {
  role: "user" | "model" | "assistant";
  content: string;
}

export interface Citation {
  title: string;
  slug: string;
  category: string;
}

export interface ChatSession {
  sessionId: string;
  history: ChatMessage[];
}

export interface StreamCallbacks {
  onToken: (token: string) => void;
  onCitations: (citations: Citation[]) => void;
  onError: (error: Error) => void;
  onComplete: () => void;
}

export interface IAiService {
  streamResponse(
    query: string,
    session: ChatSession,
    callbacks: StreamCallbacks
  ): Promise<void>;
}

// ── 7. SEARCH LAYER ──
export interface SearchQuery {
  text: string;
  limit?: number;
  namespace?: string;
}

export interface SearchResult {
  id: string;
  title: string;
  slug: string;
  snippet: string;
  score: number;
  category: string;
}

export interface ISearchService {
  search(query: SearchQuery): Promise<SearchResult[]>;
}

// ── 8. GITHUB INTEGRATION LAYER ──
export interface GithubRepository {
  name: string;
  description: string;
  url: string;
  stars: number;
  forks: number;
  languages: Record<string, number>;
  updatedAt: string;
}

export interface GithubRelease {
  tagName: string;
  name: string;
  body: string;
  publishedAt: string;
}

export interface IGithubService {
  getRepositories(): Promise<GithubRepository[]>;
  getRepositoryReadme(repoName: string): Promise<string>;
  getLatestReleases(repoName: string, limit?: number): Promise<GithubRelease[]>;
  getPinnedStats(): Promise<Record<string, any>>;
}

// ── 9. OBSERVABILITY & TELEMETRY LAYER ──
export interface TelemetryEvent {
  name: string;
  category: "interaction" | "performance" | "error" | "ai" | "api";
  metadata?: Record<string, any>;
}

export interface IObservability {
  info(message: string, meta?: Record<string, any>): void;
  warn(message: string, meta?: Record<string, any>): void;
  error(message: string, error?: any, meta?: Record<string, any>): void;
  debug(message: string, meta?: Record<string, any>): void;
  trackEvent(event: TelemetryEvent): void;
  trackMetric(name: string, value: number, tags?: Record<string, string>): void;
  startSpan(name: string): { end: () => void };
}

// ── 10. FEATURE FLAGS LAYER ──
export interface IFeatureFlags {
  isEnabled(flag: string): boolean;
  getFlagValue<T>(flag: string, defaultValue: T): T;
  getAllFlags(): Record<string, any>;
}

// ── 11. SECURITY BOUNDARY LAYER ──
export interface ISecurityProvider {
  validateTurnstileToken(token: string): Promise<boolean>;
  sanitizeHtml(dirty: string): string;
  getCspHeaders(): Record<string, string>;
  getCorsConfig(): Record<string, string>;
}

// ── 12. FILE UPLOADER LAYER ──
export interface UploadProgress {
  uploadedBytes: number;
  totalBytes: number;
  percentage: number;
}

export interface IFileUploader {
  uploadFile(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<{ url: string; fileId: string }>;
  uploadChunked(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<{ url: string; fileId: string }>;
}

// ── 13. INTERNATIONALIZATION (i18n) LAYER ──
export type Locale = "en" | "id";

export interface ITranslator {
  getLocale(): Locale;
  setLocale(locale: Locale): void;
  translate(key: string, variables?: Record<string, string>): string;
}
