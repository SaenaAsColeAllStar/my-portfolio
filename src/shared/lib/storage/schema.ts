import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

/**
 * Core polymorphic content table representing any knowledge item.
 * Specific content type attributes (like latency for projects, company for experience)
 * are stored in the `extraMetadata` JSON string column.
 */
export const contentNodes = sqliteTable("content_nodes", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  type: text("type").notNull(), // 'project' | 'article' | 'adr' | 'prd' | 'api_doc' | 'research_note' | 'timeline' | 'experience' | 'skill' | etc.
  title: text("title").notNull(),
  summary: text("summary"),
  body: text("body"), // Raw markdown narrative or editor structured JSON
  status: text("status").notNull().default("draft"), // 'draft' | 'published' | 'archived' | 'scheduled'
  version: text("version").notNull().default("1.0.0"),
  publishedAt: text("published_at"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
  readingTime: integer("reading_time"), // Estimated reading time in minutes
  
  // SEO Metadata
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  seoKeywords: text("seo_keywords"),
  seoCanonical: text("seo_canonical"),
  
  // AI Grounding & RAG Metadata
  aiEmbeddingsStatus: text("ai_embeddings_status").notNull().default("pending"), // 'pending' | 'indexed' | 'failed'
  aiChunkContext: text("ai_chunk_context"), // Pre-processed dense semantic context for Virtual Cole retrieval
  
  // Polymorphic Metadata
  extraMetadata: text("extra_metadata"), // JSON stringified object representing type-specific properties
});

/**
 * Relational table defining the directed acyclic graph (DAG) connections
 * between different content items (e.g., Project -> ADR, ADR -> PRD).
 */
export const contentRelations = sqliteTable("content_relations", {
  sourceId: text("source_id")
    .notNull()
    .references(() => contentNodes.id, { onDelete: "cascade" }),
  targetId: text("target_id")
    .notNull()
    .references(() => contentNodes.id, { onDelete: "cascade" }),
  relationType: text("relation_type").notNull(), // 'parent_of' | 'child_of' | 'adr_for' | 'prd_for' | 'api_for' | 'references' | 'case_study_for'
}, (table) => ({
  pk: primaryKey({ columns: [table.sourceId, table.targetId] }),
}));

/**
 * Version control history table for content revisions and rollback safety.
 */
export const contentVersions = sqliteTable("content_versions", {
  id: text("id").primaryKey(),
  nodeId: text("node_id")
    .notNull()
    .references(() => contentNodes.id, { onDelete: "cascade" }),
  version: text("version").notNull(),
  title: text("title").notNull(),
  summary: text("summary"),
  body: text("body"),
  extraMetadata: text("extra_metadata"), // stringified JSON metadata snapshot
  revisionNotes: text("revision_notes"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

/**
 * Registry mapping for media uploads directed to Cloudflare R2 object storage.
 */
export const mediaAssets = sqliteTable("media_assets", {
  id: text("id").primaryKey(),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  r2Key: text("r2_key").notNull().unique(), // The path key in R2 or local upload folder
  altText: text("alt_text"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

/**
 * Audit log table recording administrative actions in the CMS.
 */
export const activityLogs = sqliteTable("activity_logs", {
  id: text("id").primaryKey(),
  action: text("action").notNull(), // 'create' | 'update' | 'publish' | 'archive' | 'rollback' | 'upload' | 'delete'
  nodeId: text("node_id"),
  nodeTitle: text("node_title"),
  details: text("details"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});
