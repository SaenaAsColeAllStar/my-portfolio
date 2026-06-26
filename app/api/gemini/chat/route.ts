import { NextRequest } from "next/server";
import { executeRAGPipeline } from "../../../../src/shared/lib/ai/rag-pipeline";

export const runtime = "nodejs"; // Dynamic Node/Edge compatible local route

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid or empty messages array provided" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Extract the latest query and historical messages
    const userMessage = messages[messages.length - 1];
    const userQuery = userMessage.content;
    
    // Map previous turns into the standard format expected by the provider (user <-> model/assistant)
    const history = messages.slice(0, -1).map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? ("model" as const) : ("user" as const),
      content: m.content
    }));

    // Trigger the edge-native RAG pipeline
    const { stream } = await executeRAGPipeline(userQuery, history);

    // Convert string chunks to Uint8Array stream for HTTP transport
    const textEncoder = new TextEncoder();
    const transformStream = new TransformStream({
      transform(chunk, controller) {
        controller.enqueue(textEncoder.encode(chunk));
      }
    });

    const outputStream = stream.pipeThrough(transformStream);

    // Return plain text stream response
    return new Response(outputStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      }
    });
  } catch (error: any) {
    console.error("[CMS-AI-API] Chat route execution failed:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
