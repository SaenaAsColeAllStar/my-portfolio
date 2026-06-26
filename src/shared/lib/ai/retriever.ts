import { db } from "../storage/db-client";
import { contentNodes } from "../storage/schema";
import { eq, or, and, sql } from "drizzle-orm";
import type { AIModelProvider } from "./ai-provider";

export interface RetrievalChunk {
  id: string;
  slug: string;
  type: string;
  title: string;
  summary: string;
  body: string;
  score: number;
  metadata: any;
  chunkContext: string;
}

/**
 * Hybrid Semantic & Keyword Content Retriever.
 * Leverages Cloudflare Vectorize in production and falls back to a weighted
 * SQLite keyword-relevance search locally to maintain a zero-config dev environment.
 */
export class DualModeRetriever {
  private aiProvider: AIModelProvider;

  constructor(aiProvider: AIModelProvider) {
    this.aiProvider = aiProvider;
  }

  /**
   * Semantic Retrieval executing D1 keyword index matching or Vectorize query matching.
   */
  async retrieve(query: string, limit: number = 3, env: any = {}): Promise<RetrievalChunk[]> {
    // Check if Cloudflare Vectorize binding is available
    const vectorizeIndex = (process.env as any).VECTOR_INDEX || env.VECTOR_INDEX;

    if (vectorizeIndex) {
      try {
        console.log("[CMS-RETRIEVER] Cloudflare Vectorize bound. Initiating semantic embedding query...");
        
        // 1. Generate Query Vector Embedding
        const queryVector = await this.aiProvider.generateEmbeddings(query);
        
        // 2. Query Vectorize Index
        const matches = await vectorizeIndex.query(queryVector, {
          topK: limit,
          returnValues: false,
          returnMetadata: true
        });

        if (matches.matches && matches.matches.length > 0) {
          const matchIds = matches.matches.map((m: any) => m.id);
          
          // 3. Hydrate matching nodes from D1 relational database
          const results = [];
          for (const id of matchIds) {
            const nodes = await db.select().from(contentNodes).where(eq(contentNodes.id, id)).limit(1);
            if (nodes[0] && nodes[0].status === "published") {
              const node = nodes[0];
              const score = matches.matches.find((m: any) => m.id === id)?.score || 0.8;
              results.push({
                id: node.id,
                slug: node.slug,
                type: node.type,
                title: node.title,
                summary: node.summary || "",
                body: node.body || "",
                score,
                metadata: node.extraMetadata ? JSON.parse(node.extraMetadata) : {},
                chunkContext: node.aiChunkContext || node.summary || ""
              });
            }
          }
          return results;
        }
      } catch (err) {
        console.warn("[CMS-RETRIEVER] Vectorize retrieval failed, falling back to SQLite hybrid search:", err);
      }
    }

    // LOCAL FALLBACK: Highly Optimized Weighted SQL Keyword Search
    console.log("[CMS-RETRIEVER] Fallback: Running local SQL hybrid keyword-relevance matching...");
    
    // Parse query into structural keywords (strip short/common words)
    const stopWords = new Set(["the", "and", "a", "of", "to", "in", "is", "for", "on", "with", "that", "this", "it", "how", "what", "who", "where", "why", "about", "your", "did"]);
    const keywords = query
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .split(/\s+/)
      .map(k => k.trim())
      .filter(k => k.length > 1 && !stopWords.has(k));

    if (keywords.length === 0) {
      // Fallback: fetch latest published content nodes if no key terms are parsed
      const fallbackNodes = await db
        .select()
        .from(contentNodes)
        .where(eq(contentNodes.status, "published"))
        .limit(limit);

      return fallbackNodes.map((node: any) => ({
        id: node.id,
        slug: node.slug,
        type: node.type,
        title: node.title,
        summary: node.summary || "",
        body: node.body || "",
        score: 0.5,
        metadata: node.extraMetadata ? JSON.parse(node.extraMetadata) : {},
        chunkContext: node.aiChunkContext || node.summary || ""
      }));
    }

    // Build SQLite SQL CASE statement weighting matches (Title = 5, Tags/Metadata = 3, Summary = 2, Body = 1)
    const sqlChunks = keywords.map((_, idx) => {
      return `
        (CASE WHEN lower(title) LIKE :kw_${idx} THEN 5 ELSE 0 END) +
        (CASE WHEN lower(extra_metadata) LIKE :kw_${idx} THEN 3 ELSE 0 END) +
        (CASE WHEN lower(summary) LIKE :kw_${idx} THEN 2 ELSE 0 END) +
        (CASE WHEN lower(body) LIKE :kw_${idx} THEN 1 ELSE 0 END)
      `;
    });

    const sumScoreSql = sqlChunks.join(" + ");
    const sqlQuery = `
      SELECT id, slug, type, title, summary, body, extra_metadata, ai_chunk_context,
             (${sumScoreSql}) as match_score
      FROM content_nodes
      WHERE status = 'published' AND (${sumScoreSql}) > 0
      ORDER BY match_score DESC
      LIMIT ${limit}
    `;

    // Map keywords to params in sql template bindings
    const rawParams: Record<string, string> = {};
    keywords.forEach((kw, idx) => {
      rawParams[`kw_${idx}`] = `%${kw}%`;
    });

    try {
      // Query raw Drizzle/SQLite using SQL builder template interpolation
      const bindParams = Object.entries(rawParams).map(([k, v]) => sql.raw(`:${k}`));
      
      // Execute local SQLite weighted query
      const rawResults = await db.run(sql.raw(sqlQuery.replace(/:kw_\d+/g, (m) => {
        // Map placeholder named bindings back to SQLite prepare coordinates
        return `'${rawParams[m.slice(1)]}'`;
      })));

      const rows = rawResults.rows || [];

      return rows.map((row: any) => {
        const extraMeta = row.extra_metadata ? JSON.parse(row.extra_metadata) : {};
        // Normalize SQLite rows back to RetrievalChunk contracts
        return {
          id: row.id,
          slug: row.slug,
          type: row.type,
          title: row.title,
          summary: row.summary || "",
          body: row.body || "",
          score: Number(row.match_score) / 10,
          metadata: extraMeta,
          chunkContext: row.ai_chunk_context || row.summary || ""
        };
      });
    } catch (e) {
      console.error("[CMS-RETRIEVER] SQLite hybrid matching failed:", e);
      return [];
    }
  }
}
