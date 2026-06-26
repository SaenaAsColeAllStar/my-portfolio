import { appConfig } from "../../config/app-config";
import { LocalCMSAdapter, ApiCMSAdapter } from "./cms-client";
import type { ICmsService } from "../../types/platform";
import type { Project, Article, TimelineItem } from "../../types/domain";

/**
 * CMS Platform Service.
 * Implements the ICmsService contract, dynamically routing calls
 * to either the LocalCMSAdapter or the ApiCMSAdapter based on configuration.
 */
export class CmsPlatformService implements ICmsService {
  private activeAdapter = appConfig.cms.source === "api"
    ? new ApiCMSAdapter()
    : new LocalCMSAdapter();

  async getProjects(): Promise<Project[]> {
    return this.activeAdapter.getProjects();
  }

  async getProject(slug: string): Promise<Project | null> {
    return this.activeAdapter.getProjectBySlug(slug);
  }

  async getArticles(): Promise<Article[]> {
    return this.activeAdapter.getArticles();
  }

  async getArticle(slug: string): Promise<Article | null> {
    return this.activeAdapter.getArticleBySlug(slug);
  }

  async getTimeline(): Promise<TimelineItem[]> {
    return this.activeAdapter.getTimeline();
  }
}

export const cmsPlatformService = new CmsPlatformService();
export default cmsPlatformService;
