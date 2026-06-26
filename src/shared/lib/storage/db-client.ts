import * as schema from "./schema";

let db: any;

// Detect if we are in the Cloudflare Edge runtime with the D1 Database binding
if (process.env.DB) {
  // Dynamic require for edge-safe loading
  const { drizzle } = require("drizzle-orm/d1");
  db = drizzle(process.env.DB, { schema });
} else {
  // Local Next.js (Node.js) environment.
  // Use eval('require') to bypass Next.js Webpack static bundling analysis,
  // preventing native C++ better-sqlite3 compilation errors during production edge builds.
  const Database = eval('require')("better-sqlite3");
  const { drizzle } = eval('require')("drizzle-orm/better-sqlite3");
  const path = eval('require')("path");
  const fs = eval('require')("fs");

  const dbDir = path.resolve(process.cwd(), "src/shared/lib/storage");
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  const dbPath = path.join(dbDir, "cms.db");
  const sqlite = new Database(dbPath);
  
  // Bootstrap the database schema tables if they do not exist (Zero-Config local setup)
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS content_nodes (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      summary TEXT,
      body TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      version TEXT NOT NULL DEFAULT '1.0.0',
      published_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      reading_time INTEGER,
      seo_title TEXT,
      seo_description TEXT,
      seo_keywords TEXT,
      seo_canonical TEXT,
      ai_embeddings_status TEXT NOT NULL DEFAULT 'pending',
      ai_chunk_context TEXT,
      extra_metadata TEXT
    );

    CREATE TABLE IF NOT EXISTS content_relations (
      source_id TEXT NOT NULL REFERENCES content_nodes(id) ON DELETE CASCADE,
      target_id TEXT NOT NULL REFERENCES content_nodes(id) ON DELETE CASCADE,
      relation_type TEXT NOT NULL,
      PRIMARY KEY (source_id, target_id)
    );

    CREATE TABLE IF NOT EXISTS content_versions (
      id TEXT PRIMARY KEY,
      node_id TEXT NOT NULL REFERENCES content_nodes(id) ON DELETE CASCADE,
      version TEXT NOT NULL,
      title TEXT NOT NULL,
      summary TEXT,
      body TEXT,
      extra_metadata TEXT,
      revision_notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS media_assets (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size_bytes INTEGER NOT NULL,
      r2_key TEXT NOT NULL UNIQUE,
      alt_text TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      action TEXT NOT NULL,
      node_id TEXT,
      node_title TEXT,
      details TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db = drizzle(sqlite, { schema });

  // Dynamically import the seeder via ES6 import() to break circular dependencies
  // and ensure Webpack resolves the path correctly at compile time.
  import("./seed")
    .then(({ seedDatabase }) => {
      seedDatabase().catch((err) => console.error("[CMS-INIT] Auto-seed failed:", err));
    })
    .catch((err) => console.error("[CMS-INIT] Failed to load seeder module:", err));
}

export { db };
