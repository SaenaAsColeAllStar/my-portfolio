import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

// Lazy-initialized GoogleGenAI SDK client
let aiClient: GoogleGenAI | null = null;

function getAiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Memory-cached documentation context to avoid redundant disk Reads
let cachedDocsContext = "";

function getDocsContext() {
  if (cachedDocsContext) return cachedDocsContext;

  try {
    const docsDir = path.join(process.cwd(), "docs");
    if (!fs.existsSync(docsDir)) {
      return "No documentation directories found on server.";
    }

    const files = fs.readdirSync(docsDir);
    let compiledContext = "";

    for (const file of files) {
      if (file.endsWith(".md")) {
        const filePath = path.join(docsDir, file);
        const fileContent = fs.readFileSync(filePath, "utf-8");
        compiledContext += `\n\n--- DOCUMENT: ${file} ---\n${fileContent}\n`;
      }
    }

    cachedDocsContext = compiledContext;
    return cachedDocsContext;
  } catch (error) {
    console.error("Failed to compile documents context:", error);
    return "Error reading documentation context from disk.";
  }
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Invalid or empty messages array provided" },
        { status: 400 }
      );
    }

    // Initialize AI Client safely
    const ai = getAiClient();

    // Compile dynamic context from the /docs files
    const docsContext = getDocsContext();

    // Master System Instruction setting the direct, professional Systems Architect persona
    const systemInstruction = `You are Virtual Cole, the digital mind of Cole, a world-class AI and Systems Engineer.
Your purpose is to answer technical, architectural, and biographical inquiries on behalf of Cole.

### Core Guidelines:
1. Grounding: Rely exclusively on the provided context blocks (Projects, Articles, and Timeline JSON in the documentation below). If the information is missing, admit it. Never invent roles, metrics, or technologies.
2. Style: Write like a senior systems architect. Be concise, objective, and direct. Avoid corporate padding, excessive pleasantries, and exclamation marks.
3. Formatting: Use clean markdown headings, short bullet lists, and monospace text for code fragments, paths, and database tables.
4. Active Citations: Whenever you describe a system or article, always end the sentence by referencing the target slug using brackets: [Project: slug] or [Article: slug].
5. Anti-Slop: Do not output system telemetry, mock terminal lines, or simulated infrastructure logs in your responses. Keep answers human-oriented and technically pristine.

Here is the complete factual context about Cole's projects, systems, experiences, and architectures:
${docsContext}
`;

    // Map the incoming chat messages into the Gemini contents structure
    // We only support standard text parts for the chat
    const geminiContents = messages.map((m: { role: string; content: string }) => {
      return {
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      };
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: geminiContents,
      config: {
        systemInstruction,
        temperature: 0.2, // Keep it highly deterministic and accurate
      },
    });

    const replyText = response.text || "I apologize, but my core neural logic encountered a synchronization frame mismatch. Please retry.";

    return NextResponse.json({ text: replyText });
  } catch (error: any) {
    console.error("Error in Virtual Cole Assistant API:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
