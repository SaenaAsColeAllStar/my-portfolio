export interface Message {
  role: "user" | "model" | "system";
  content: string;
}

export interface AIModelProvider {
  generateStream(prompt: string, systemInstruction: string, history: Message[]): Promise<ReadableStream<string>>;
  generateEmbeddings(text: string): Promise<number[]>;
}

/**
 * High-Performance, Zero-Dependency Gemini REST Provider for Cloudflare Edge.
 * Bypasses heavy SDK bundles, using direct HTTP stream streaming and embeddings endpoints.
 */
export class GeminiProvider implements AIModelProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateStream(prompt: string, systemInstruction: string, history: Message[]): Promise<ReadableStream<string>> {
    const model = "gemini-2.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${this.apiKey}`;

    // Format chat history and current prompt into Gemini contents JSON contract
    const contents = [
      ...history.map(m => ({
        role: m.role === "system" ? "user" : m.role,
        parts: [{ text: m.content }]
      })),
      {
        role: "user",
        parts: [{ text: prompt }]
      }
    ];

    const payload = {
      contents,
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      generationConfig: {
        temperature: 0.1, // Near-deterministic outputs to ensure strict grounding
        maxOutputTokens: 2048
      }
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errBody = await response.text().catch(() => "");
      throw new Error(`Gemini API stream initiation failed: HTTP ${response.status} - ${errBody}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    return new ReadableStream({
      async start(controller) {
        if (!reader) {
          controller.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || ""; // Retain incomplete line in buffer

            for (const line of lines) {
              const cleaned = line.trim();
              if (cleaned.startsWith("data:")) {
                const jsonStr = cleaned.slice(5).trim();
                if (jsonStr === "[DONE]") continue;

                try {
                  const data = JSON.parse(jsonStr);
                  const textChunk = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
                  if (textChunk) {
                    controller.enqueue(textChunk);
                  }
                } catch (e) {
                  // Silent parse bypass for keep-alive SSE packets
                }
              }
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      }
    });
  }

  async generateEmbeddings(text: string): Promise<number[]> {
    const model = "text-embedding-004";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${this.apiKey}`;

    const payload = {
      model: `models/${model}`,
      content: {
        parts: [{ text }]
      }
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Gemini Embeddings API failed: HTTP ${response.status}`);
    }

    const data = await response.json();
    const vector = data.embedding?.values;

    if (!vector || !Array.isArray(vector)) {
      throw new Error("Failed to retrieve embedding vector values from Gemini API.");
    }

    return vector;
  }
}

/**
 * Cloudflare Edge-Native Workers AI Fallback Provider.
 * Connects to the local Workers AI bindings, ensuring 100% serverless autonomy.
 */
export class WorkersAIProvider implements AIModelProvider {
  private aiBinding: any;

  constructor(aiBinding: any) {
    if (!aiBinding) {
      throw new Error("Cloudflare Workers AI binding is required for this provider.");
    }
    this.aiBinding = aiBinding;
  }

  async generateStream(prompt: string, systemInstruction: string, history: Message[]): Promise<ReadableStream<string>> {
    // Maps chat history into the standard OpenAI-styled chat contract used by Workers AI
    const messages = [
      { role: "system", content: systemInstruction },
      ...history.map(m => ({
        role: m.role === "model" ? "assistant" : m.role,
        content: m.content
      })),
      { role: "user", content: prompt }
    ];

    const stream = await this.aiBinding.run("@cf/meta/llama-3.1-8b-instruct", {
      messages,
      stream: true,
      temperature: 0.1,
      max_tokens: 1024
    });

    return stream;
  }

  async generateEmbeddings(text: string): Promise<number[]> {
    const result = await this.aiBinding.run("@cf/baai/bge-small-en-v1.5", {
      text: [text]
    });
    
    const vector = result.data?.[0];
    if (!vector || !Array.isArray(vector)) {
      throw new Error("Failed to retrieve embedding values from Workers AI binding.");
    }
    
    return vector;
  }
}

/**
 * Local Grounded Mock AI Provider.
 * Runs in local development when no API keys or bindings are resolved,
 * preventing HTTP 500 errors and providing a zero-config demonstration of RAG capabilities.
 */
export class MockAIProvider implements AIModelProvider {
  async generateStream(prompt: string, systemInstruction: string, history: Message[]): Promise<ReadableStream<string>> {
    // Extract the grounded context from the system instruction
    const contextStart = systemInstruction.indexOf("[GROUNDED CONTEXT]:");
    let contextText = "";
    if (contextStart !== -1) {
      contextText = systemInstruction.substring(contextStart + 19).trim();
    }

    // Determine a response based on the query or the context
    let responseText = "";
    
    if (!contextText || contextText.includes("No matching context found")) {
      responseText = "I apologize, but that information is not available in my grounding database. I only answer questions about Cole's projects, experience, and system designs.";
    } else {
      // Parse the context to synthesize a simulated answer
      // Find the first source title, summary, and slug
      const sourceMatch = contextText.match(/Title:\s*(.+)\nSummary:\s*(.+)/);
      const slugMatch = contextText.match(/Slug:\s*([^\s\n]+)/);
      
      if (sourceMatch && slugMatch) {
        const title = sourceMatch[1].trim();
        const summary = sourceMatch[2].trim();
        const slug = slugMatch[1].trim();
        
        responseText = `Based on my grounded knowledge base, let's discuss **${title}**.\n\n${summary}\n\nThis system is implemented using Cole's technical stack, optimizing edge routing and caching pipelines to deliver low latency. [Project: ${slug}]\n\n*(Note: Running in local simulation mode. Configure \`GEMINI_API_KEY\` in your \`.env.local\` to activate the live Gemini reasoning engine.)*`;
      } else {
        responseText = `Based on my grounded knowledge base, I found relevant information regarding your query:\n\n${contextText.substring(0, 250)}...\n\n*(Note: Running in local simulation mode. Configure \`GEMINI_API_KEY\` in your \`.env.local\` to activate the live Gemini reasoning engine.)*`;
      }
    }

    const words = responseText.split(" ");
    
    return new ReadableStream({
      async start(controller) {
        for (const word of words) {
          controller.enqueue(word + " ");
          // Simulate streaming typing speed (40ms per word)
          await new Promise(resolve => setTimeout(resolve, 40));
        }
        controller.close();
      }
    });
  }

  async generateEmbeddings(text: string): Promise<number[]> {
    // Return a dummy 384-dimension vector for local SQLite keyword matching
    return new Array(384).fill(0).map(() => Math.random());
  }
}

/**
 * Smart Factory Resolver returning the active AI provider based on environmental variables.
 */
export function getAIProvider(env: any = {}): AIModelProvider {
  const geminiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY;
  if (geminiKey) {
    return new GeminiProvider(geminiKey);
  }

  const workersAIBinding = process.env.AI || env.AI;
  if (workersAIBinding) {
    return new WorkersAIProvider(workersAIBinding);
  }

  // Fall back to MockAIProvider in local development instead of throwing
  console.warn("[CMS-AI] No active AI Provider resolved. Falling back to MockAIProvider for local simulation.");
  return new MockAIProvider();
}
