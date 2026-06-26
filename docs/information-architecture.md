# Cole.dev — Information Architecture & Data Specifications

This document defines the comprehensive **Information Architecture (IA)** and **Content Modeling Schemas** for Cole.dev. It has been compiled by the Information Architect and Senior Software Architect to establish clear layouts, routes, schema definitions, and navigation systems before implementing the database and physical code.

---

## 1. Navigational Hierarchy & Route Design (Next.js App Router)

To keep the experience fluid, seamless, and high-performance, Cole.dev uses a **Single-Screen Hybrid Router Layout**. The core views are delivered via a master canvas layout on `/` utilizing React state, URL hash routing, or query parameters (supporting robust SEO and deep linking), supplemented by dedicated lightweight server routes and API proxy handlers.

### 1.1 App Router Paths

```
/
├── (routes)
│   ├── page.tsx                  # Master Canvas (Unified Grid & Panel orchestrator)
│   ├── blog/
│   │   └── [slug]/
│   │       └── page.tsx          # Dynamic SEO fallback for editorial notebooks
│   ├── projects/
│   │   └── [slug]/
│   │       └── page.tsx          # Dynamic SEO fallback for system case studies
│   └── layout.tsx                # Font configurations (Space Grotesk + Inter + JetBrains Mono)
├── api/
│   ├── gemini/
│   │   └── chat/
│   │       └── route.ts          # Server-side context-grounded assistant proxy (Gemini 3.5 Flash)
│   ├── search/
│   │   └── route.ts          # Semantic / keyword search index endpoint
│   └── contact/
│       └── route.ts              # Secure form processing & Slack/Email relay
```

### 1.2 Multi-State Canvas Orchestration

The master view at `/` changes its panel arrangements dynamically based on active search parameters or URL parameters:

- **`?view=dashboard`** (Default): Responsive grid featuring current focal points, real-time code composition telemetry, active micro-neural cluster, and prompt-based exploration launcher.
- **`?project=[slug]`**: Triggers the **"Glass Box" Split Screen** panel. Fades out the background grid, sliding in the vector-rendered Interactive D3 Architecture Map on the left and the complete architectural breakdown on the right.
- **`?notebook=[slug]`**: Triggers the **Editorial Reading Frame**. Fades in single-column reading typography with isolated margins.
- **`?timeline=true`**: Expands the developmental log representing the engineering trajectory.
- **`?assistant=true`**: Opens the fully interactive minimal terminal console at the bottom-right corner.

---

## 2. Interactive Navigation Components

### 2.1 The Master floating Console (Floating Dock)
A highly polished, Framer-style floating navigation dock anchored at the bottom-center of the viewport.
- **Visuals:** Framed by an ultra-thin border (`border border-white/10` or `rgba(17,17,16,0.04)`), frosted background backdrop blur (`backdrop-blur-md`), and microscopic shadow depth.
- **Items:**
  1. **Core Canvas** (`Dashboard`) — Direct state reset.
  2. **Systems** (`Projects`) — Expands systems list overlay.
  3. **Intellect** (`Notebook/Blog`) — Opens long-form writing index.
  4. **Trajectory** (`Timeline`) — Scrolls/transitions to chronological milestones.
  5. **Terminal** (`AI Assistant`) — Focuses the direct AI command bar.
- **Micro-Interaction:** Hovering over dock icons uses fluid scale expansion inspired by macOS dock transitions.

### 2.2 Command Palette & Semantic Search (`Cmd+K`)
A globally available modal triggered via `Cmd+K`, `Ctrl+K`, or a dedicated launcher button on the dashboard.
- **Layout:** Sleek modal backdrop blurring the behind layers, featuring a text input line using `JetBrains Mono`.
- **Search Engine:** Integrates a client-side mini-search index (or `/api/search` proxy) querying across projects, articles, timeline items, and direct navigation links.
- **Command Layout:**
  - `> Go to System: [Project Name]`
  - `> Read Article: [Title]`
  - `> Trajectory: [Year/Milestone]`
  - `> Consult Assistant: [Write a direct query]`
  - `> Execute System Command: [Clear State / Re-center Layout]`

---

## 3. CMS Content Modeling & Schemas (Conceptual)

To enable seamless CMS-like delivery without unnecessary database overhead during Phase 05, the content is modeled into static typed JSON arrays, fully structured to transition directly to Firestore or D1 when requested.

### 3.1 Project Schema (`IProject`)
Each project represents a detailed system architecture case study.

```typescript
export interface IProject {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  category: "AI Engineering" | "Systems Architecture" | "Distributed Systems";
  period: string; // e.g. "Q1 2026"
  status: "active" | "completed" | "research-phase";
  technologies: string[]; // e.g. ["Next.js", "Cloudflare Workers", "Gemini 3.5"]
  metrics: {
    latency?: string; // e.g. "45ms p95"
    costReduction?: string; // e.g. "72% lower inference"
    scalability?: string; // e.g. "10M+ daily events"
  };
  githubUrl?: string;
  liveUrl?: string;
  architectureNodes: {
    id: string;
    label: string;
    type: "client" | "edge-worker" | "api-gateway" | "database" | "model" | "cache";
    connections: string[]; // Target node IDs
  }[];
  contentMarkdown: string; // The fully loaded, complete case study breakdown
}
```

### 3.2 Notebook/Article Schema (`IArticle`)
For long-form technical publications.

```typescript
export interface IArticle {
  id: string;
  slug: string;
  title: string;
  summary: string;
  publishedAt: string; // ISO date format
  readTime: string; // e.g., "7 min read"
  tags: string[];
  contentMarkdown: string; // Long-form editorial technical content
}
```

### 3.3 Trajectory/Timeline Schema (`ITimelineEvent`)
To map technical progression and accomplishments chronologically.

```typescript
export interface ITimelineEvent {
  id: string;
  year: string;
  date: string; // Specific date label e.g., "Oct 2025"
  title: string;
  roleOrContext: string; // e.g. "Lead AI Engineer"
  companyOrProject: string; // e.g. "ColeAllStar Lab"
  description: string;
  technologiesUsed?: string[];
  links?: {
    label: string;
    url: string;
  }[];
}
```

---

## 4. Grounded AI Knowledge Base Architecture

To prevent "Virtual Cole" from hallucinating, the assistant queries a grounded technical context pool.

```
                  ┌─────────────────────────────────────┐
                  │          Visitor Query              │
                  └──────────────────┬──────────────────┘
                                     │
                        (POST to /api/gemini/chat)
                                     ▼
                  ┌─────────────────────────────────────┐
                  │      Context Retriever Layer        │
                  │   - Queries Local Markdown Docs     │
                  │   - Gathers Schemas & Project Logs  │
                  └──────────────────┬──────────────────┘
                                     │
                    (Injects into System Instruction)
                                     ▼
                  ┌─────────────────────────────────────┐
                  │    Gemini 3.5 Flash Model Engine    │
                  └──────────────────┬──────────────────┘
                                     │
                         (Server-Sent Stream Response)
                                     ▼
                  ┌─────────────────────────────────────┐
                  │      Interactive Terminal UI        │
                  └─────────────────────────────────────┘
```

### 4.1 System Instruction Blueprint

The system instructions for the server-side model initialization will strictly instruct the model to behave as an extension of Cole's technical consciousness, relying exclusively on the provided schemas, markdown projects, and timeline logs.

---

*This Information Architecture document aligns structural layout logic with premium product UX. It creates clean paths for physical file setups in subsequent phases.*
