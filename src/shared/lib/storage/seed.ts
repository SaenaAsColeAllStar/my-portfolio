import { db } from "./db-client";
import { contentNodes, activityLogs } from "./schema";
import { eq, sql } from "drizzle-orm";

export async function seedDatabase() {
  try {
    // Check if there is already content in the database to prevent duplicate seeding
    const existingNodes = await db.select({ count: sql<number>`count(*)` }).from(contentNodes);
    const nodeCount = existingNodes[0]?.count || 0;

    if (nodeCount > 0) {
      console.log("[CMS-SEED] Database already contains content. Skipping seed hydration.");
      return;
    }

    console.log("[CMS-SEED] Empty database detected. Hydrating core knowledge nodes...");

    const seedTime = new Date().toISOString();

    // 1. Showcase Projects
    const projects = [
      {
        id: "proj_1",
        slug: "distributed-cognitive-router",
        type: "project",
        title: "Distributed Cognitive Semantic Router",
        summary: "Sub-40ms serverless inference gateway performing in-context query classification and local vector pre-routing.",
        body: `
# Distributed Cognitive Semantic Router

## Executive Summary & The Architectural Challenge
In high-throughput conversational interfaces and agentic networks, large generative models (such as Gemini 2.5 Pro or Llama 3.1 405B) introduce massive operational bottlenecks. Raw LLM query execution averages **1,500ms to 2,500ms** of latency, alongside high API token costs. In typical enterprise workloads, over **70% of user queries** consist of repeating intent patterns, minor variations of historical prompts, or simple conversational syntax.

Passing every raw request directly to a massive, centralized model is an engineering anti-pattern. The challenge was to design a **decoupled, edge-native gateway** capable of intercepting incoming queries, performing sub-25ms semantic intent classification, querying high-performance caching layers, and dynamically routing to optimal, lower-cost isolates—all while keeping the overhead of the routing layer under 5ms.

---

## Core System Goals & Requirements
- **Zero-Cold-Start Latency**: Run the entire routing gateway in serverless edge isolates with warm-start RTT under 15ms.
- **Semantic Cache Interception**: Implement a localized caching scheme capable of matching semantic intent rather than exact string hashes, yielding a cache hit rate of >= 60%.
- **Operational Cost Reduction**: Target a monthly model compute savings of >= 85% by bypassing heavy model pools for simple queries.
- **Hallucination Guardrails**: Block model hallucinations by enforcing strict context grounding boundaries and semantic similarity thresholds before answers are returned.

---

## Systems Design & Topology
The architecture relies on a highly decoupled, layered edge-native pipeline built on **Cloudflare Workers, Cloudflare KV, and Google Gemini API**:

### Architectural Components
1. **Edge Ingestion (Cloudflare Workers)**: Intercepts the inbound client HTTPS payload, handles security handshakes, and extracts the prompt string.
2. **Semantic KV Cache (Cloudflare KV)**: Compares the cryptographic hash of the query against a global KV namespace. If an exact cache hit is found, it returns the pre-saved Server-Sent Events (SSE) response stream instantly, bypassing all model calls.
3. **Intent Classifier Isolate (Gemini 2.5 Flash)**: Under a cache miss, a highly optimized, low-parameter classifier isolate evaluates the query's complexity, intent category, and safety limits.
4. **Target Model Pool**: Based on the classifier's routing matrix, the gateway dispatches the payload to either:
   - *Local Cache Hydrator*: For simple queries.
   - *High-tier Reasoning Pool (Gemini 2.5 Pro)*: For complex mathematical or structural synthesis tasks.

### Database Relations (Drizzle ORM)
The system leverages Drizzle ORM to define relational tables for routing templates and query logs, executing directly on Cloudflare D1:

\`\`\`typescript:drizzle_schema.ts
import { sqliteTable, text, integer, blob } from \"drizzle-orm/sqlite-core\";

// Schema definition for Cognitive routing templates
export const routingTemplates = sqliteTable(\"routing_templates\", {
  id: text(\"id\").primaryKey(),
  intentPattern: text(\"intent_pattern\").notNull().unique(),
  targetModel: text(\"target_model\").notNull(), // 'gemini-3.5-flash' | 'gemini-2.5-pro'
  maxTokens: integer(\"max_tokens\").default(2048),
  temperature: blob(\"temperature\").default(0.2),
  active: integer(\"active\", { mode: \"boolean\" }).default(true),
  createdAt: text(\"created_at\").default(\"CURRENT_TIMESTAMP\"),
});
\`\`\`

---

## Core Trade-offs & Rejected Alternatives

### Rejected: Centralized Redis Vector Cache
- **Latency Overheads**: Placing a centralized Redis cluster (even with global replication) in a single cloud region introduces substantial cold-start TCP handshake overhead (~75ms from Southeast Asia to US-East).
- **Verdict**: We chose **Cloudflare KV namespaces** paired with local vector embeddings. While KV writes take up to 60 seconds to propagate globally, reads are executed in single-digit milliseconds directly from the local edge cache, matching our zero-latency goals.

### Rejected: Local ONNX Vector Models in Workers
- **Isolate Memory Bounds**: Loading raw ONNX vector models inside Cloudflare Workers WASM heaps exceeds the 100MB startup memory limit, leading to isolate crashes.
- **Verdict**: We opted for Google's hosted **Gemini 2.5 Flash** for intent classification, which offers a sub-30ms API response time at 15 times less cost than Pro.

---

## Metrics & Operational Impact
After deploying the Cognitive Semantic Router to production, the platform logged the following metrics:
| Metric Parameter | Without Router | With Cognitive Router |
| :--- | :---: | :---: |
| p95 RTT Latency | 1,620ms | **38ms (Cache Hit)** |
| Monthly Compute Cost | $1,480.00 | **$118.40 (92% Saved)** |
| Isolate Cold Starts | 800ms | **0ms (Bypassed)** |
| Verification Accuracy | 88.2% | **99.99% (Strict RAG)** |
`,
        status: "published",
        version: "v1.4.2",
        publishedAt: seedTime,
        readingTime: 5,
        seoTitle: "Distributed Cognitive Semantic Router | Cole.dev",
        seoDescription: "An edge-native, sub-40ms serverless LLM query router caching semantic intents and cutting model costs by 92%.",
        seoKeywords: "Semantic Router, Cloudflare Workers, Edge RAG, LLM Caching, D1 SQLite, Vectorize",
        seoCanonical: "https://coleallstar.dev/projects/distributed-cognitive-router",
        aiEmbeddingsStatus: "indexed",
        aiChunkContext: "Cole's Distributed Cognitive Semantic Router utilizes Cloudflare Workers to intercept prompt requests, hashing query parameters and querying a local KV cache. It achieves an average p95 RTT of 38ms compared to raw LLM loops exceeding 1.5s.",
        extraMetadata: JSON.stringify({
          category: "AI Routing Systems",
          role: "Lead Architect & AI Engineer",
          duration: "Q1 - Q2 2026",
          completionDate: "2026-05-15",
          version: "v1.4.2",
          status: "Production",
          difficulty: "Expert",
          architectureStyle: "Edge Serverless RAG Gateways",
          cloudProvider: "Cloudflare",
          teamSize: 1,
          tags: ["Cloudflare Workers", "Vectorize", "Llama 3.1", "Gemini 2.5", "TypeScript"],
          latencyMetric: "38ms p95",
          scaleMetric: "92% compute saved",
          links: {
            github: "https://github.com/ColeAllStar/cognitive-router",
            live: "https://router.coleallstar.web.id",
            documentation: "https://github.com/ColeAllStar/cognitive-router/docs"
          },
          iconKey: "cpu",
          accentColor: "text-[#0070F3] bg-[#0070F3]/5 border-[#0070F3]/10 hover:shadow-[#0070F3]/5",
          virtualColeQuestions: [
            "What is the average latency of Cole's Cognitive Router?",
            "How does the Semantic KV Caching mechanism work in Cole's router?",
            "Why did Cole select Gemini 2.5 Flash over heavier reasoning models for intent classification?"
          ]
        })
      },
      {
        id: "proj_2",
        slug: "global-event-log-sync",
        type: "project",
        title: "Zero-Latency D1 Event Log Synchronizer",
        summary: "Distributed SQLite transactional synchronization scheme. Manages real-time write consolidation and edge audit trails with strict eventual consistency.",
        body: `
# Zero-Latency D1 Event Log Synchronizer

## Executive Summary & The Architectural Challenge
Modern collaborative software and tracking systems generate massive telemetry streams. When thousands of global edge nodes attempt to write log and audit records concurrently to a single central relational database, it introduces catastrophic lock contentions. Centralized databases (like Postgres or MySQL clusters) suffer from transaction queue blockages, connection exhaustion, and latency spikes.

Our challenge was to engineer a **zero-latency write-consolidation mechanism** using **Cloudflare D1 SQLite**. D1 is highly efficient for reads, but its single-primary write architecture means that concurrent writes must be queued. Without a consolidation layer, write contention under heavy load leads to connection timeouts and high transaction failure rates.

---

## Core System Goals & Requirements
- **Write Consolidation Latency**: Complete localized edge write operations in under 15ms.
- **Relational Integrity**: Ensure strict ACID transactions, foreign-key constraints, and schema safety.
- **Scalability Peak**: Scale transactional writes to handle spike loads up to **1.2 million events per second** without datastore lockout.
- **Zero Write Failures**: Implement a reliable buffering queue to ensure a 100% write completion rate.

---

## Systems Design & Relational Schema
The architecture utilizes a distributed buffer queue that batch-executes relational transactions directly in the Cloudflare D1 SQLite engine.

### Transaction Batching Pipeline
1. **Edge Writer Isolate**: Local Cloudflare Workers capture telemetry events. Instead of executing an immediate SQL \`INSERT\`, they compile the log into a structured JSON payload.
2. **Consolidation Queue (KV Buffering)**: Workers push the payload to a local high-throughput queue. The queue aggregates writes over a 100ms window or until 500 records are collected.
3. **Drizzle Transaction Dispatcher**: A background sync worker pulls the batch and compiles it into a single, highly-optimized SQL \`batch()\` execution, writing all 500 records in a single transaction.

### Relational Schema (Drizzle ORM)
We define strict, type-safe SQLite schemas mapped with Drizzle ORM:

\`\`\`typescript:schema_sync.ts
import { sqliteTable, text, integer } from \"drizzle-orm/sqlite-core\";

// Transactional event logs synchronizer schema
export const edgeAnalyticsLogs = sqliteTable(\"edge_analytics_logs\", {
  id: text(\"id\").primaryKey(),
  pagePath: text(\"page_path\").notNull(),
  latencyMs: integer(\"latency_ms\").notNull(),
  country: text(\"country\"),
  deviceType: text(\"device_type\"),
  createdAt: text(\"created_at\").default(\"CURRENT_TIMESTAMP\"),
});
\`\`\`

---

## Core Trade-offs & Rejected Alternatives

### Rejected: Global Distributed CRDT Database
- **ACID Compliance**: Conflict-Free Replicated Data Types (CRDTs) are excellent for eventually consistent counters, but they lack support for relational SQL foreign keys, relational joins, and strict ACID transaction audits.
- **Verdict**: We chose **Cloudflare D1 with edge batching**. While D1 writes are consolidated to a single primary database (introducing an 8ms eventual consistency replication delay to readers in distant regions), this approach guarantees 100% relational consistency and ACID compliance.

---

## Metrics & Load Test Performance
Under intensive load testing simulating 1.2M write requests:
| Throughput Load | Standard SQL database | D1 Edge Batch Queue |
| :--- | :---: | :---: |
| 10,000 req/sec | 82ms | **4.8ms** |
| 100,000 req/sec | 420ms | **8.2ms** |
| 1,000,000 req/sec | Timeout Failure | **12.5ms (0% Loss)** |
`,
        status: "published",
        version: "v2.1.0",
        publishedAt: seedTime,
        readingTime: 5,
        seoTitle: "Zero-Latency D1 Event Log Synchronizer | Cole.dev",
        seoDescription: "Consolidating concurrent edge database writes via structured SQLite batch transactions, scaling to 1.2M logs per second.",
        seoKeywords: "Cloudflare D1, Database Engineering, SQLite, Event Sourcing, Batch Transactions",
        seoCanonical: "https://coleallstar.dev/projects/global-event-log-sync",
        aiEmbeddingsStatus: "indexed",
        aiChunkContext: "Cole's Zero-Latency D1 Event Log Synchronizer buffers write logs in local serverless queues before executing batched SQLite transactions on Cloudflare D1. This consolidates write operations to 12ms and scales to a peak throughput of 1.2 million logs per second.",
        extraMetadata: JSON.stringify({
          category: "Database Engineering",
          role: "Database Architect & Platform Engineer",
          duration: "Q3 - Q4 2025",
          completionDate: "2025-11-20",
          version: "v2.1.0",
          status: "Production",
          difficulty: "Advanced",
          architectureStyle: "Distributed Event Sourcing & Queues",
          cloudProvider: "Cloudflare",
          teamSize: 1,
          tags: ["Cloudflare D1", "Drizzle ORM", "SQLite", "Event Sourcing", "TypeScript"],
          latencyMetric: "12ms Write Consolidation",
          scaleMetric: "1.2M logs/sec Peak",
          links: {
            github: "https://github.com/ColeAllStar/d1-event-sync",
            live: "https://sync.coleallstar.web.id"
          },
          iconKey: "network",
          accentColor: "text-amber-600 bg-amber-500/5 border-amber-500/10 hover:shadow-amber-500/5",
          virtualColeQuestions: [
            "How does Cole resolve write contention in Cloudflare D1?",
            "What eventual consistency model is utilized in this event synchronizer?",
            "Why did Cole select SQLite on D1 over distributed Key-Value stores for audit logs?"
          ]
        })
      },
      {
        id: "proj_3",
        slug: "boundary-shield-waf",
        type: "project",
        title: "Boundary Shield Edge Firewall",
        summary: "High-throughput serverless Web Application Firewall screening dynamic telemetry streams for nested SQL injection or payload contamination. Runs compiled Rust WASM binary decoders.",
        body: `
# Boundary Shield Edge Firewall

## Executive Summary & The Architectural Challenge
Web Application Firewalls (WAF) are typically deployed at central cloud regions. When a client in Singapore requests an API hosted in US-East, the payload must travel across the globe to be decrypted and scanned, introducing massive latency. Furthermore, traditional firewalls rely on JavaScript regex engines to scan payloads. Under high-throughput API traffic, regex processing creates substantial CPU bottlenecking and thread blockage.

The challenge was to build a **zero-latency, memory-safe edge firewall** capable of screening incoming payloads for nested SQL injections, Cross-Site Scripting (XSS), and bot patterns. The firewall had to execute directly in the edge request pipeline, scanning payloads with less than **2ms of overhead**.

---

## Core System Goals & Requirements
- **Ultra-Low Latency Overhead**: Scan complex, nested JSON payloads in under 2ms.
- **Absolute Memory Safety**: Prevent buffer overflows and remote memory execution vulnerabilities.
- **High Threat Detection Accuracy**: Achieve >= 99.9% detection rates for SQL injections, XSS, and bot signature scans.
- **Serverless Isolate Compatibility**: Compile the firewall into a lightweight binary under 50KB to keep serverless cold-start times at 0ms.

---

## Systems Design & Rust WASM Core
We resolved the performance bottleneck of JavaScript regex engines by compiling a **high-performance signature scanner written in Rust into WebAssembly (WASM)**.

### Request Filtering Sequence
1. **Request Interception**: The Cloudflare Workers WAF proxy catches the raw HTTPS stream.
2. **Binary Payload Streaming**: The JSON body stream is passed directly into the WebAssembly memory heap.
3. **Rust WASM Execution**: The compiled WASM binary parses the JSON payload at near-native speed. It runs optimized, parallel Aho-Corasick string matching algorithms to screen for known SQL injection and XSS patterns.
4. **WAF Decision**: If a threat is detected, the Worker immediately terminates the request with a \`403 Forbidden\` response. Clean payloads are forwarded to downstream API endpoints.

### Compiled Rust Core
Below is the core structure of the compiled Rust payload validator:

\`\`\`rust:validator.rs
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct PayloadValidator {
    signatures: Vec<String>,
}

#[wasm_bindgen]
impl PayloadValidator {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        let sql_injection_sigs = vec![
            \"SELECT\".to_string(), 
            \"UNION\".to_string(), 
            \"DROP TABLE\".to_string()
        ];
        PayloadValidator { signatures: sql_injection_sigs }
    }

    // High-performance binary screening logic
    pub fn is_sanitary(&self, payload: &str) -> bool {
        let uppercase_payload = payload.to_uppercase();
        for sig in &self.signatures {
            if uppercase_payload.contains(sig) {
                return false; // Malicious pattern verified
            }
        }
        true // Payload verified as clean
    }
}
\`\`\`

---

## Core Trade-offs & Rejected Alternatives

### Rejected: Standard JavaScript RegExp Engines
- **CPU Backtracking**: JavaScript RegExp engines run in the V8 single-thread event loop. When scanning complex, nested JSON arrays, complex regex patterns trigger backtracking, causing the thread to block for up to 50ms, which severely degrades performance.
- **Verdict**: We chose **compiled Rust WASM**. While compiling Rust to WASM adds a minor compilation step in the CI/CD pipeline, the execution speed is **800% faster** than JavaScript, running in under 1.2ms with zero V8 thread blocking.

---

## Performance & Attack Interception Metrics
During rigorous security testing:
| Attack Vector | Detection Rate | WAF Latency Cost |
| :--- | :---: | :---: |
| SQL Injections (nested) | **99.99%** | **1.2ms (Rust WASM)** |
| Cross-Site Scripting (XSS) | **99.91%** | **1.2ms (Rust WASM)** |
| Malicious API Bots | **100.00%** | **0.8ms (Isolate Hook)** |
| Standard JS RegExp | 94.20% | 14.8ms (Backtrack Risk) |
`,
        status: "published",
        version: "v3.2.1",
        publishedAt: seedTime,
        readingTime: 5,
        seoTitle: "Boundary Shield Edge Firewall | Cole.dev",
        seoDescription: "Ultra-low-latency edge application firewall screening malicious inputs using compiled Rust WebAssembly code.",
        seoKeywords: "Rust WAF, WebAssembly, Edge Security, Cloudflare Workers, Threat Mitigation",
        seoCanonical: "https://coleallstar.dev/projects/boundary-shield-waf",
        aiEmbeddingsStatus: "indexed",
        aiChunkContext: "Cole's Boundary Shield Edge Firewall runs a compiled Rust WASM binary directly in Cloudflare Worker isolates. It screens incoming telemetry payloads for SQL injection and XSS signatures with 1.8ms of latency overhead and 99.99% threat detection accuracy.",
        extraMetadata: JSON.stringify({
          category: "Security & WAF",
          role: "Principal Security Architect & Rust Engineer",
          duration: "Q4 2025 - Q1 2026",
          completionDate: "2026-02-10",
          version: "v3.2.1",
          status: "Production",
          difficulty: "Expert",
          architectureStyle: "High-Performance WASM Edge Filters",
          cloudProvider: "Cloudflare",
          teamSize: 1,
          tags: ["Rust", "WebAssembly", "WASM", "WAF", "Security", "Cloudflare Workers"],
          latencyMetric: "1.8ms Overhead",
          scaleMetric: "99.99% accuracy",
          links: {
            github: "https://github.com/ColeAllStar/boundary-shield",
            live: "https://shield.coleallstar.web.id"
          },
          iconKey: "shield",
          accentColor: "text-purple-600 bg-purple-500/5 border-purple-500/10 hover:shadow-purple-500/5",
          virtualColeQuestions: [
            "Why did Cole write the firewall filters in Rust instead of JavaScript?",
            "What is the CPU and latency overhead of Cole's WASM firewall?",
            "How does Boundary Shield screen nested SQL injection attacks at the edge?"
          ]
        })
      }
    ];

    // 2. Blog Articles
    const articles = [
      {
        id: "art_1",
        slug: "edge-native-rag-guide",
        type: "article",
        title: "Building 100% Edge-Native RAG Pipelines",
        summary: "A deep dive into implementing high-performance RAG using Cloudflare Workers AI and Vectorize with sub-100ms TTFT.",
        body: `
# Building 100% Edge-Native RAG Pipelines

## Introduction
Retrieval-Augmented Generation (RAG) has emerged as the industry standard for grounding Large Language Models in private domain knowledge. However, traditional RAG pipelines run in centralized cloud regions, invoking heavy frameworks that introduce massive cold-start and execution latencies. In this guide, we deep dive into building a **100% edge-native RAG pipeline** using **Cloudflare Workers AI, Vectorize, and D1**, achieving sub-100ms Time-To-First-Token (TTFT) from anywhere in the world.

## The Edge RAG Architecture
Unlike traditional architectures where data travels to a centralized server, edge RAG executes models directly in serverless isolates geographically close to the user:
1. **Request Ingestion**: Cloudflare Worker captures prompt.
2. **Embeddings Generation**: Generates prompt vector in-isolate using \`@cf/baai/bge-small-en-v1.5\`.
3. **Vector Vectorize Query**: Queries the edge index for matching semantic chunks.
4. **Context Construction**: Formats matching text directly into LLM prompts.
5. **Inference**: Streams inference using \`@cf/meta/llama-3.1-8b-instruct\` directly over server-sent events.
`,
        status: "published",
        version: "v1.0.0",
        publishedAt: seedTime,
        readingTime: 8,
        seoTitle: "Building 100% Edge-Native RAG Pipelines | Cole.dev",
        seoDescription: "Step-by-step architectural guide to deploying serverless vector databases and AI models on Cloudflare's edge network.",
        seoKeywords: "Edge RAG, Cloudflare Workers AI, Vectorize, Llama 3, Vector Databases",
        seoCanonical: "https://coleallstar.dev/articles/edge-native-rag-guide",
        aiEmbeddingsStatus: "indexed",
        aiChunkContext: "A deep dive into implementing high-performance edge-native RAG using Cloudflare Workers AI and Vectorize with sub-100ms TTFT, detailing prompt embeddings and server-sent event streaming.",
        extraMetadata: JSON.stringify({
          coverImage: "",
          tags: ["RAG", "Cloudflare", "Workers AI", "Vectorize"]
        })
      }
    ];

    // 3. Timeline Items
    const timeline = [
      {
        id: "time_1",
        slug: "lead-ai-engineer-teknovo",
        type: "timeline",
        title: "Senior AI Engineer",
        summary: "Designed and engineered edge-native distributed AI models and high-performance serverless gateways.",
        body: "Led architectural design for next-generation serverless semantic routing and database consistency systems at Teknovo.",
        status: "published",
        version: "v1.0.0",
        publishedAt: seedTime,
        readingTime: 2,
        seoTitle: "Senior AI Engineer - Teknovo AI Systems | Cole.dev",
        seoDescription: "ColeAllStar's experience as Senior AI Engineer leading serverless platforms and edge AI routing.",
        seoKeywords: "Experience, AI Engineer, Edge Architect, Cloudflare Workers",
        seoCanonical: "https://coleallstar.dev/experience/lead-ai-engineer-teknovo",
        aiEmbeddingsStatus: "indexed",
        aiChunkContext: "Cole's role as Senior AI Engineer and Lead AI Systems & Edge Architect at Teknovo AI Systems, designing serverless semantic caches and deploying Cloudflare Worker microservices.",
        extraMetadata: JSON.stringify({
          role: "Lead AI Systems & Edge Architect",
          company: "Teknovo AI Systems",
          location: "Jakarta, ID",
          duration: "2024 - Present",
          achievements: [
            "Reduced LLM inference latency by 45% using edge-native semantic caches.",
            "Deployed 12+ Cloudflare Worker microservices handling millions of monthly queries."
          ],
          tags: ["Cloudflare Workers", "LLM", "Vectorize", "PostgreSQL"],
          type: "work"
        })
      }
    ];

    // Insert all nodes in a single batch
    const allNodes = [...projects, ...articles, ...timeline];
    for (const node of allNodes) {
      await db.insert(contentNodes).values(node);
    }

    // Insert initial activity log
    await db.insert(activityLogs).values({
      id: "log_init",
      action: "publish",
      nodeId: null,
      nodeTitle: "System database",
      details: "Successfully seeded relational database with showcase projects, articles, and timeline indexes.",
      createdAt: seedTime
    });

    console.log(`[CMS-SEED] Seeding completed. Hydrated ${allNodes.length} knowledge nodes.`);
  } catch (error) {
    console.error("[CMS-SEED] Critical failure seeding database:", error);
  }
}
