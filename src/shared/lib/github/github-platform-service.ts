import { apiClient } from "../api/api-client";
import { telemetry } from "../observability/observability-platform";
import type { IGithubService, GithubRepository, GithubRelease } from "../../types/platform";

/**
 * GitHub Integration Platform Service.
 * Implements the IGithubService contract using the fluent API client.
 * Fetches repository data, releases, and profile metrics from the API gateway.
 */
export class GithubPlatformService implements IGithubService {
  async getRepositories(): Promise<GithubRepository[]> {
    telemetry.debug("GithubPlatform: Fetching repository index");
    return apiClient
      .get<GithubRepository[]>("/api/github/repos")
      .executeData();
  }

  async getRepositoryReadme(repoName: string): Promise<string> {
    telemetry.debug(`GithubPlatform: Fetching README for ${repoName}`);
    const data = await apiClient
      .get<{ readme: string }>(`/api/github/repos/${repoName}/readme`)
      .executeData();
    return data.readme;
  }

  async getLatestReleases(repoName: string, limit = 5): Promise<GithubRelease[]> {
    telemetry.debug(`GithubPlatform: Fetching releases for ${repoName}`);
    return apiClient
      .get<GithubRelease[]>(`/api/github/repos/${repoName}/releases`)
      .param("limit", limit)
      .executeData();
  }

  async getPinnedStats(): Promise<Record<string, any>> {
    telemetry.debug("GithubPlatform: Fetching pinned profile statistics");
    return apiClient
      .get<Record<string, any>>("/api/github/stats")
      .executeData();
  }
}

export const githubPlatformService = new GithubPlatformService();
export default githubPlatformService;
