# Cole.dev — Database Architecture & Data Storage Specification

This document outlines the high-performance **Database Architecture** for Cole.dev (Phase 10). Designed by the Software Architect, Lead Database Engineer, and Cloud Infrastructure Specialist, this architecture combines SQL relational models, key-value caches, and blob object storage into an optimal, zero-cold-start, edge-ready distributed storage paradigm.

---

## 1. Storage Paradigm: The Hybrid Tri-Tier Architecture

To achieve sub-millisecond page rendering and native server-side edge execution, we reject traditional bloated centralized databases. Instead, we use a custom **Tri-Tier Storage Strategy** optimized for Cloudflare and Vercel Edge networks:

```
                ┌──────────────────────────────────────────────────┐
                │               API / Edge Middleware              │
                └────────┬────────────────┬────────────────┬───────┘
                         │                │                │
      (Transactional / Relational)  (Static Assets)   (High-Speed Cache / Grounding)
                         ▼                ▼                ▼
                ┌────────────────┐┌────────────────┐┌────────────────┐
                │ Relational SQL ││  Blob Storage  ││   Key-Value    │
                │ (Cloudflare D1)││(Cloudflare R2)││(Cloudflare KV)│
                └────────────────┘└────────────────┘└────────────────┘
```

1. **Relational Tier (Cloudflare D1 / Drizzle ORM):**
   - **Role:** Handles core transactional data requiring integrity, complex filters, and relational constraints (User sessions, messages, project models, blogging, analytics logs).
   - **Characteristics:** SQL-compliant, distributed SQLite database residing directly at the edge, guaranteeing zero cold-start latencies.

2. **Key-Value Tier (Cloudflare KV):**
   - **Role:** Fast cache layer and grounding index storage for the **Virtual Cole** AI Assistant.
   - **Characteristics:** Global, low-latency key-value engine. Keeps pre-indexed markdown segments, project metadata summaries, and rate-limit counters immediately warm.

3. **Object/Blob Tier (Cloudflare R2):**
   - **Role:** Handles all raw media files, architectural SVG exports, user-uploaded resumes, or project assets.
   - **Characteristics:** AWS S3-compatible, zero-egress-fee blob storage. Served through custom CDN routes with localized edge-caching headers.

---

### 1.1 Deployed Cloudflare Production Resources

To map these design principles into operational cloud hardware, the following active edge infrastructure has been provisioned under the `my-portfolio` scope:

*   **D1 SQLite Database (Relational SQL Tier):**
    *   **Binding Name:** `DB`
    *   **Database Name:** `coleallstar`
    *   **Database ID:** `3514bbc0-c632-477b-b14e-7133413a567f`
*   **Cloudflare KV (Caching & AI Grounding Tier):**
    *   **Binding Name:** `KV_BINDING`
    *   **Namespace ID:** `036ba3dbe36a4f84b5c98a6e221ec327`
*   **Cloudflare R2 Object Storage (Blob Tier):**
    *   **Bucket Name:** `coleallstar`
    *   **S3 API Endpoint:** `https://c0ed6ab96bc27307522c11a6f62506fe.r2.cloudflarestorage.com/coleallstar`
*   **Observability & Telemetry Config:**
    *   **Traces & Logs:** Persisted at a 100% head sampling rate for active performance profiling and invocation auditing without performance penalty.

---

## 2. Relational Entity-Relationship (ER) Schema

Below are the architectural definitions of the primary SQL relational tables, fully designed for type safety with **TypeScript / Drizzle ORM**.

```
  ┌──────────────┐          ┌──────────────┐          ┌──────────────┐
  │    Users     │ 1      N │   Sessions   │          │  Categories  │
  │ (User Mgmt)  ├─────────>│  (Auth Logs) │          │(Project/Blog)│
  └──────┬───────┘          └──────────────┘          └──────┬───────┘
         │ 1                                                 │ 1
         │                                                   │
         │ N                                                 │ N
  ┌──────▼───────┐          ┌──────────────┐          ┌──────▼───────┐
  │   Articles   │ N      M │  Tags / Joins│ M      N │   Projects   │
  │ (Blog Posts) ├─────────>│ (ManyToMany) ├─────────>│ (Case Studies)│
  └──────┬───────┘          └──────────────┘          └──────┬───────┘
         │ 1                                                 │ 1
         │                                                   │
         │ N                                                 │ N
  ┌──────▼───────┐                                    ┌──────▼───────┐
  │  SEO_Metadata│                                    │  Arch_Nodes  │
  │  (SEO Config)│                                    │(D3 System Map)│
  └──────────────┘                                    └──────────────┘
```

---

### 2.1 User & Security Schema

#### `users` Table
Stores administrative and developer credentials for CMS management.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT (UUID)` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unique user identifier |
| `email` | `TEXT` | `UNIQUE`, `NOT NULL` | Admin email address |
| `password_hash` | `TEXT` | `NOT NULL` | Argon2id secure hash |
| `role` | `TEXT` | `NOT NULL`, `DEFAULT 'visitor'` | Roles: `admin` \| `collaborator` \| `visitor` |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Profile creation timestamp |
| `updated_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Last updated timestamp |

#### `sessions` Table
Manages secure login state and IP-based auditing at the edge.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT (UUID)` | `PRIMARY KEY` | Secure session token identifier |
| `user_id` | `TEXT (UUID)` | `FOREIGN KEY REFERENCES users(id)` | Associated administrative user |
| `ip_address` | `TEXT` | `NOT NULL` | Client IP address for auditing |
| `user_agent` | `TEXT` | `NOT NULL` | Browser fingerprint agent |
| `expires_at` | `TIMESTAMP` | `NOT NULL` | Expiration date (defaults to 14 days) |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Authentication time |

---

### 2.2 Content Management (Projects & Blog)

#### `categories` Table
Organizes systems and articles into distinct core groupings.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT (UUID)` | `PRIMARY KEY` | Category identifier |
| `slug` | `TEXT` | `UNIQUE`, `NOT NULL` | URL-safe slug (e.g., `ai-engineering`) |
| `name` | `TEXT` | `NOT NULL` | Friendly label (e.g., "AI Engineering") |
| `description` | `TEXT` | | Purpose description |

#### `projects` Table
Holds detailed, high-contrast system architecture case studies.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT (UUID)` | `PRIMARY KEY` | Project identifier |
| `slug` | `TEXT` | `UNIQUE`, `NOT NULL` | URL-safe slug (e.g., `realtime-synchronizer`) |
| `title` | `TEXT` | `NOT NULL` | Title of the system case study |
| `subtitle` | `TEXT` | `NOT NULL` | Under-line summary descriptor |
| `category_id` | `TEXT (UUID)` | `FOREIGN KEY REFERENCES categories(id)` | Mapped core category |
| `status` | `TEXT` | `NOT NULL` | State: `active` \| `completed` \| `research` |
| `period` | `TEXT` | `NOT NULL` | Display timeline tag (e.g., "Q1 2026") |
| `metrics_json` | `TEXT` | `NOT NULL` | JSON blob storing latency, scale, and costs |
| `github_url` | `TEXT` | | Direct link to public code repository |
| `live_url` | `TEXT` | | Live production deployment URL |
| `content_markdown`| `TEXT` | `NOT NULL` | Extensive structural case study body |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Project timestamp |

#### `architecture_nodes` Table
Defines individual coordinate entries for the **D3 Interactive SVG Map** within details.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT (UUID)` | `PRIMARY KEY` | Node identifier |
| `project_id` | `TEXT (UUID)` | `FOREIGN KEY REFERENCES projects(id)` | Associated parent case study |
| `label` | `TEXT` | `NOT NULL` | Node title (e.g., "Cloudflare KV Cache") |
| `type` | `TEXT` | `NOT NULL` | Type: `client` \| `edge` \| `gateway` \| `db` \| `model` |
| `connections_json`| `TEXT` | `NOT NULL` | JSON array containing target connected Node IDs |

#### `articles` Table
Stores long-form editorial technical logs and post-mortems.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT (UUID)` | `PRIMARY KEY` | Article identifier |
| `slug` | `TEXT` | `UNIQUE`, `NOT NULL` | URL slug (e.g., `optimizing-inference-latency`) |
| `title` | `TEXT` | `NOT NULL` | Title of the publication |
| `summary` | `TEXT` | `NOT NULL` | High-level index summary |
| `read_time` | `TEXT` | `NOT NULL` | Calculated reading duration (e.g., "7 min read") |
| `content_markdown`| `TEXT` | `NOT NULL` | Long-form reading document |
| `published_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Public release date |

#### `tags` & `post_tags` Tables
Facilitates robust Many-to-Many tagging logic across both projects and blog articles.

| Table Name | Column | Type | Constraints |
| :--- | :--- | :--- | :--- |
| **`tags`** | `id` | `TEXT (UUID)` | `PRIMARY KEY` |
| | `name` | `TEXT` | `UNIQUE`, `NOT NULL` |
| **`post_tags`**| `id` | `TEXT (UUID)` | `PRIMARY KEY` |
| | `tag_id` | `TEXT (UUID)` | `FOREIGN KEY REFERENCES tags(id)` |
| | `project_id` | `TEXT (UUID)` | `FOREIGN KEY REFERENCES projects(id)` (Nullable) |
| | `article_id` | `TEXT (UUID)` | `FOREIGN KEY REFERENCES articles(id)` (Nullable) |

---

### 2.3 System SEO & Meta Configuration

#### `seo_metadata` Table
Ensures perfect, dynamic OpenGraph, structured micro-schema, and meta-tag injection.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT (UUID)` | `PRIMARY KEY` | Metadata identifier |
| `target_path` | `TEXT` | `UNIQUE`, `NOT NULL` | Target path pattern (e.g., `/projects/realtime-sync`) |
| `meta_title` | `TEXT` | `NOT NULL` | SEO HTML Head title |
| `meta_description`| `TEXT` | `NOT NULL` | Search result snippet text |
| `og_image_url` | `TEXT` | | OpenGraph card background asset link |
| `keywords_json` | `TEXT` | | JSON string list of meta keywords |

---

### 2.4 Lead Generation & Conversations

#### `messages` Table
Tracks direct inbound client inquiries and scheduled contact requests.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT (UUID)` | `PRIMARY KEY` | Message identifier |
| `sender_name` | `TEXT` | `NOT NULL` | Sender full name |
| `sender_email` | `TEXT` | `NOT NULL` | Target reply email address |
| `subject` | `TEXT` | `NOT NULL` | Purpose of contact |
| `body` | `TEXT` | `NOT NULL` | Body composition |
| `status` | `TEXT` | `NOT NULL`, `DEFAULT 'unread'` | Status: `unread` \| `responded` \| `archived` |
| `ip_fingerprint` | `TEXT` | | Rate-limit verification ip |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Dispatch timestamp |

#### `newsletter_subscribers` Table
Captures subscribers for technical architecture mailing updates.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT (UUID)` | `PRIMARY KEY` | Subscriber identifier |
| `email` | `TEXT` | `UNIQUE`, `NOT NULL` | Subscriber email address |
| `active` | `BOOLEAN` | `DEFAULT TRUE` | Subscription status active |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Signup timestamp |

---

### 2.5 Cognitive Telemetry & Edge Analytics

#### `edge_analytics_logs` Table
A high-performance log tracking real-time API latency and page view compositions directly from edge hooks.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT (UUID)` | `PRIMARY KEY` | Log entry identifier |
| `page_path` | `TEXT` | `NOT NULL` | Visited path target (e.g., `/`) |
| `latency_ms` | `INTEGER` | `NOT NULL` | Page generation latency in milliseconds |
| `country` | `TEXT` | | Visitor region derived from edge headers |
| `device_type` | `TEXT` | | Derived client device (Mobile \| Desktop \| Tablet) |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Action timestamp |

---

## 3. Key-Value Core Schema (Cloudflare KV)

Used for ultra-high-speed lookups and grounding storage, avoiding heavy SQL queries during active user conversations.

### 3.1 Namespace Map: `COLE_MIND_CACHE`

- **Key Format:** `grounding:project:[slug]`
  - **Value Schema:** Stringified JSON storing pre-segmented paragraphs, code paths, and schema nodes of that project. Fed directly to the Gemini API prompt.
- **Key Format:** `grounding:timeline`
  - **Value Schema:** JSON array of raw milestone events, allowing the model to quickly answer: *"Where did Cole work in 2024?"*
- **Key Format:** `telemetry:system_status`
  - **Value Schema:** Static JSON holding real-time metrics (e.g. current CPU loads, direct API success rates) for the dashboard.
- **Key Format:** `ratelimit:ip:[ip_address]`
  - **Value Schema:** Integer (count of API hits within active 60s window), expiring via KV TTL keys automatically to guarantee security.

---

## 4. Third-Party Edge Sync Integrations

### 4.1 GitHub Repository Polling (CRON Workflow)
To maintain real-time telemetry on Cole’s active research and commits without burdening client runtimes, a serverless background worker (e.g., Cloudflare Cron Trigger) syncs GitHub metadata:
- **Interval:** Runs every 3 hours.
- **Payload:** Fetches commit rates, updated repos, and lines of code.
- **Storage:** Updates the `telemetry:system_status` KV cache payload and App logs.

---

*This comprehensive database schema is fully modular, extremely lightweight, and structurally optimized to run on distributed edge computing with zero-lag profiles.*
