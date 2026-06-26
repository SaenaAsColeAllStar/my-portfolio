# Cole.dev — Administrative CMS Product Specification

This document details the complete **Administrative CMS Product Design** for Cole.dev (Phase 12). Compiled by the Lead Product Designer and Senior Full Stack Engineer, this specification defines the dashboard, project/article editing interfaces, draft workflows, dynamic redirects, and real-time analytical telemetry views.

---

## 1. Product Philosophy: The High-Fidelity Editing Console

The Cole.dev CMS is not an afterthought; it is a premium workspace designed for maximum efficiency, clean typography, and structural content management. It rejects bloated admin templates in favor of a **minimalist, high-contrast, multi-column workspace** that aligns with the primary portfolio’s aesthetic.

```
+─────────────────────────────────────────────────────────────+
|  [COLE.DEV CMS]  |  Dashboard  |  Projects  |  Memos  |  SEO  |
+─────────────────────────────────────────────────────────────+
|                                                             |
|  +─────────────────────────+   +──────────────────────────+ |
|  |     WRITING CANVAS      |   |      SYSTEM METADATA     | |
|  |                         |   |                          | |
|  |  # Dynamic Cache...     |   |  Category: [AI Systems]  | |
|  |                         |   |  Latency:  [45ms p95]    | |
|  |  To achieve zero...     |   |  Status:   [Active]      | |
|  |                         |   |                          | |
|  |  ```typescript          |   |  Tags:     [Next, KV]    | |
|  |  export const...        |   |                          | |
|  |  ```                    |   |  Nodes:    [Edit D3 Map] | |
|  |                         |   |                          | |
|  +─────────────────────────+   +──────────────────────────+ |
|                                                             |
|  [DRAFT SAVED] [3:20 PM]                [PUBLISH CASE STUDY] |
+─────────────────────────────────────────────────────────────+
```

---

## 2. Core Workspace Modules

### 2.1 The Analytics Command Center (Telemetry Dashboard)
- **Primary View:** High-density, real-time analytics graphs and performance charts.
- **Key Metrics Tracked:**
  - **Core Web Vitals:** Real-time values for LCP (Largest Contentful Paint), FID (First Input Delay), and CLS (Cumulative Layout Shift) pulled directly from client edge logs.
  - **Conversational Analytics:** Total Virtual Cole inquiries, average conversational rating, and tag clouds of frequent user search topics.
  - **Inbound Pipeline:** Log of active messages received via contact sheets, with quick actions to copy email address, open calendar slot, or archive.

### 2.2 The "Glass Box" Project Editor
- **Primary View:** Dual-panel composition screen.
  - **Left Panel (Workspace Canvas):** Optimized markdown editor with syntax highlighting, auto-saving drafts, and instant keyboard shortcuts.
  - **Right Panel (System Properties Panel):** Structural form to manage project metadata:
    - **Physical Metrics:** Input fields for Latency (e.g., `45ms p95`), Cost Reductions (e.g., `72% LOWER INFERENCE`), and Scale.
    - **Technical Blueprint Designer:** A visual interface to build the **D3 interactive node map**. Allows adding nodes, choosing types (edge, db, api, client), and drawing lines to connect them.
- **Draft & Publish Workflow:**
  - Live local drafts are auto-saved to local state every 10 seconds.
  - Clicking `Publish` executes transactional serialization—writing to the relational database (SQL/D1) and immediately generating the warm lookup index inside the key-value cache (KV) for Virtual Cole's RAG pipeline.

### 2.3 The Editorial Memo Editor (Blog)
- **Primary View:** Single-column writing layout focusing purely on typography and content tracking.
- **Writing Environment:**
  - Auto-scrolling distraction-free writing mode (dimming background chrome when typing begins).
  - Drag-and-drop media integration—dropping an image immediately uploads it to Cloudflare R2, generating a responsive, optimized, lazy-loaded Next.js `<Image>` markdown tag.

---

## 3. SEO & System Redirect Control Center

To guarantee search-engine prominence and preserve historical index equity, the CMS incorporates a robust redirection and indexing suite.

### 3.1 Custom Metadata Configuration
- Direct forms to edit dynamic OpenGraph descriptions, page-by-page title structures, and JSON-LD structural micro-data for rich Google Search indexing.
- Real-time preview of how articles and projects look on Google, Twitter, and Slack when shared.

### 3.2 Dynamic Route Redirect Manager
- **Function:** Manage HTTP redirects (301 Permanent, 302 Temporary) at the edge.
- **D1 Schema Map:**
  - `source_path` (e.g., `/old-project-name`)
  - `target_path` (e.g., `/projects/realtime-sync`)
  - `status_code` (`301` \| `302`)
- **Execution:** Custom middleware intercepts requests at the Cloudflare Edge, performing lookups against D1 and executing redirects in sub-5ms, completely bypassing Next.js startup runtimes.

---

## 4. Draft-to-Production Publishing Workflows

To prevent unfinished articles or systems from exposing fragile links in the public view, we enforce a strict state machine pattern.

```
       ┌───────────┐         Local Auto-Save (10s)
       │  Created  ├────────────────────────────────┐
       └─────┬─────┘                                │
             │                                      ▼
             │                              ┌───────────────┐
             └─────────────────────────────>│  Draft State  │
                                            └───────┬───────┘
                                                    │
                                            Trigger "Publish" Action
                                                    ▼
                                            ┌───────────────┐
                                            │  Validating   │ (Linter/Contrast Checks)
                                            └───────┬───────┘
                                                    │ Passes Checks
                                                    ▼
                                            ┌───────────────┐
                                            │  Active Prod  │ (D1 Row inserted &
                                            └───────────────┘  KV Cache warmed)
```

1. **The Validation Gate:** Before moving from `Draft` to `Active Prod`, the CMS runs automatic validation:
   - Verifies all Markdown image paths map to authenticated R2 assets.
   - Audits headings structure (ensuring logical hierarchy: H1 $\rightarrow$ H2 $\rightarrow$ H3).
   - Confirms that all nodes in the SVG Architecture graph have valid structural links and do not leave disconnected paths.
2. **Synchronized Warm-Up:** Once validated, publishing commits the changes to Cloudflare D1. Simultaneously, a background task automatically parses the markdown text, slices it into semantic paragraphs, and updates the `grounding:project:[slug]` Key-Value cache (Cloudflare KV) immediately. Virtual Cole is instantly aware of the new project's capabilities.

---

*This Administrative CMS product design bridges the gap between structured development and dynamic management, providing Cole with a master control deck over his entire digital workspace.*
