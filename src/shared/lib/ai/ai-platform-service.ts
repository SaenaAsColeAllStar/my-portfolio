import { appConfig } from "../../config/app-config";
import { aiClient } from "./ai-client";
import type { IAiService, ChatSession, StreamCallbacks } from "../../types/platform";

/**
 * AI Platform Service.
 * Implements the IAiService contract using the edge-safe AI Client.
 * Routes streaming queries securely through the backend API gateway.
 */
export class AiPlatformService implements IAiService {
  private chatEndpoint = appConfig.ai.chatEndpoint;

  /**
   * Establishes a streamed response session for a chat query.
   */
  async streamResponse(
    query: string,
    session: ChatSession,
    callbacks: StreamCallbacks
  ): Promise<void> {
    // Coordinate the streaming transaction using the robust EventSource SSE client
    await aiClient.streamChat(query, session.history, callbacks);
  }
}

export const aiPlatformService = new AiPlatformService();
export default aiPlatformService;
