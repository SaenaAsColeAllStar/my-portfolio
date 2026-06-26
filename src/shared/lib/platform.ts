import { apiClient } from "./api/api-client";
import { memoryCache } from "./storage/memory-cache-provider";
import { localStorageProvider } from "./storage/local-storage-provider";
import { aiPlatformService } from "./ai/ai-platform-service";
import { cmsPlatformService } from "./cms/cms-platform-service";
import { githubPlatformService } from "./github/github-platform-service";
import { telemetry } from "./observability/observability-platform";
import { featureFlags } from "./flags/feature-flags";
import { securityProvider } from "./security/security";
import { translator } from "./i18n/translator";

/**
 * Coordinated Cole.dev Platform Gateway.
 * Provides unified, interface-enforced entry points to all edge-safe infrastructure modules,
 * completely isolating application business domains from vendor specifications.
 */
export const platform = {
  api: apiClient,
  cache: memoryCache,
  storage: localStorageProvider,
  ai: aiPlatformService,
  cms: cmsPlatformService,
  github: githubPlatformService,
  telemetry: telemetry,
  flags: featureFlags,
  security: securityProvider,
  i18n: translator,
};

export default platform;
export type { HttpResponse, HttpRequestConfig, IHttpClient } from "../types/platform";
export type { Project, Article, TimelineItem } from "../types/domain";
