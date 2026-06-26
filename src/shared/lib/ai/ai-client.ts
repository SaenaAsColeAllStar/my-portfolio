import { env } from "../../config/env";
import { AIError } from "../error/error-handler";
import { logger } from "../logger/logger";

export interface ChatMessage {
  role: "user" | "model" | "assistant";
  content: string;
}

export interface Citation {
  title: string;
  slug: string;
  category: string;
}

export interface StreamCallbacks {
  onToken: (token: string) => void;
  onCitations: (citations: Citation[]) => void;
  onError: (error: Error) => void;
  onComplete: () => void;
}

/**
 * AI Assistant Client Abstraction.
 * Handles EventSource/SSE streaming connections from the backend AI gateway.
 */
class AIClient {
  private baseUrl = env.NEXT_PUBLIC_API_URL;

  async streamChat(
    query: string,
    history: ChatMessage[],
    callbacks: StreamCallbacks
  ): Promise<void> {
    const chatUrl = `${this.baseUrl}/api/gemini/chat`;
    logger.debug(`Initializing AI Stream: POST ${chatUrl}`, { query, historyLength: history.length });

    try {
      const response = await fetch(chatUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "text/event-stream",
          "X-Cole-Client": "NextJS-Portfolio-Edge",
        },
        body: JSON.stringify({ query, history }),
      });

      if (!response.ok || !response.body) {
        let errorMsg = `HTTP stream initialization failed: ${response.statusText}`;
        try {
          const errBody = await response.json();
          if (errBody?.message) errorMsg = errBody.message;
        } catch {
          // Ignore json parsing on failure
        }
        throw new AIError(errorMsg);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || ""; // Retain last incomplete chunk

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          const eventMatch = trimmed.match(/^event:\s*(.+)$/m);
          const dataMatch = trimmed.match(/^data:\s*(.+)$/m);

          if (!dataMatch) continue;

          const eventName = eventMatch ? eventMatch[1].trim() : "message";
          const rawData = dataMatch[1].trim();

          try {
            const parsedData = JSON.parse(rawData);

            if (eventName === "message") {
              if (parsedData.text) {
                callbacks.onToken(parsedData.text);
              }
            } else if (eventName === "citations") {
              if (parsedData.sources) {
                callbacks.onCitations(parsedData.sources as Citation[]);
              }
            } else if (eventName === "done") {
              callbacks.onComplete();
              return;
            }
          } catch (e) {
            logger.warn("Failed to parse SSE data packet:", { rawData, error: e });
          }
        }
      }

      callbacks.onComplete();
    } catch (err) {
      const parsedError = err instanceof Error ? err : new Error(String(err));
      logger.error("AI Stream connection encountered a fault", parsedError);
      callbacks.onError(parsedError);
    }
  }
}

export const aiClient = new AIClient();
export default aiClient;
