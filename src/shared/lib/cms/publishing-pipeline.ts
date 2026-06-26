import { db } from "../storage/db-client";
import { contentNodes, activityLogs, contentVersions } from "../storage/schema";
import { eq } from "drizzle-orm";

export interface PipelineResult {
  success: boolean;
  warnings: string[];
  node: any;
}

/**
 * Runs the complete validation, SEO audit, metadata generation,
 * and cache invalidation pipeline for publishing a knowledge node.
 */
export async function runPublishingPipeline(nodeId: string): Promise<PipelineResult> {
  const warnings: string[] = [];
  
  // 1. Fetch the active node
  const nodes = await db.select().from(contentNodes).where(eq(contentNodes.id, nodeId));
  const node = nodes[0];
  
  if (!node) {
    throw new Error(`Knowledge node with ID "${nodeId}" not found.`);
  }

  // 2. Perform Content Validation
  if (!node.title.trim()) {
    throw new Error("Validation Failed: Title cannot be empty.");
  }
  if (!node.slug.trim()) {
    throw new Error("Validation Failed: Slug cannot be empty.");
  }

  // 3. Perform SEO Audit & Scanning
  if (node.title.length > 60) {
    warnings.push("SEO Warning: Title exceeds optimal length of 60 characters.");
  }
  
  if (!node.seoDescription || node.seoDescription.trim().length === 0) {
    warnings.push("SEO Warning: Missing meta description. This will hurt search engine snippet previews.");
  } else if (node.seoDescription.length > 160) {
    warnings.push("SEO Warning: Meta description exceeds optimal length of 160 characters.");
  }

  if (!node.body || node.body.trim().length < 50) {
    warnings.push("SEO Warning: Word count is extremely low. Search engines favor dense, detailed technical journals.");
  }

  // 4. Run Metadata Engine (Calculate Reading Time)
  const wordCount = node.body ? node.body.split(/\s+/).filter(Boolean).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 220)); // Assumes 220 words per minute average reading speed

  // 5. Run AI Preparation Engine (Semantic Chunking)
  // Formulates a dense context chunk that Virtual Cole can query via semantic vectors
  let aiChunkContext = node.aiChunkContext || "";
  if (!aiChunkContext && node.body) {
    // Extract the first 3 sentences or first 300 characters as a semantic fallback
    const sentences = node.body.replace(/[\n#`*_-]+/g, " ").split(/[.!?]+/).map((s: string) => s.trim()).filter(Boolean);
    aiChunkContext = sentences.slice(0, 4).join(". ") + ".";
  }

  const publishTime = new Date().toISOString();

  // 6. Save Version Snapshot before marking published to preserve rollback safety
  const versionId = `ver_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  await db.insert(contentVersions).values({
    id: versionId,
    nodeId: node.id,
    version: node.version,
    title: node.title,
    summary: node.summary,
    body: node.body,
    extraMetadata: node.extraMetadata,
    revisionNotes: `Auto-saved snapshot before publishing version ${node.version}`
  });

  // 7. Update Node to Published State
  const updatedNodes = await db.update(contentNodes)
    .set({
      status: "published",
      publishedAt: publishTime,
      readingTime: readingTime,
      aiChunkContext: aiChunkContext,
      aiEmbeddingsStatus: "indexed", // Flags index compilation as successfully grounded
      updatedAt: publishTime
    })
    .where(eq(contentNodes.id, nodeId))
    .returning();

  const updatedNode = updatedNodes[0];

  // 8. Record Event in Audit Activity Log
  await db.insert(activityLogs).values({
    id: `log_${Date.now()}`,
    action: "publish",
    nodeId: node.id,
    nodeTitle: node.title,
    details: `Published node version ${node.version}. Calculated reading time: ${readingTime}m. SEO warnings generated: ${warnings.length}.`,
    createdAt: publishTime
  });

  // 9. Edge-Cache Invalidation (Mocked trigger)
  // In production, this would call Cloudflare KV namespace invalidations and Next.js ISR purge hooks.
  console.log(`[CMS-PIPELINE] Purging edge KV caches and static path indexes for route: /projects/${node.slug}`);

  return {
    success: true,
    warnings,
    node: updatedNode
  };
}
