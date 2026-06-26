# Cole.dev — Global Technical Architecture Specification

This document defines the end-to-end **Technical Architecture** for Cole.dev (Phase 13). Authored by the CTO, Chief Architect, and Principal Security Engineer, this specification establishes our edge-native hosting configuration, modular folder structure, deployment pipelines, secure API design, and performance protocols.

---

## 1. Hosting & Runtime Infrastructure

To achieve sub-second page loads globally and guarantee zero cold starts, we completely reject heavy VM servers or cold-start-prone Kubernetes clusters. Cole.dev is built to compile into a fully serverless, highly optimized, **edge-native application**.

```
              ┌──────────────────────────────────────────────────┐
              │           Cloudflare Edge Anycast IP             │
              └────────────────────────┬─────────────────────────┘
                                       │
                        (WAF Rules & Rate Limiting)
                                       ▼
              ┌──────────────────────────────────────────────────┐
              │            Cloudflare Pages CDN CDN              │
              │  - Static assets served from nearest edge POPS   │
              │  - Sub-10ms response times globally              │
              └────────────────────────┬─────────────────────────┘
                                       │ (Edge Routing)
                                       ▼
              ┌──────────────────────────────────────────────────┐
              │           Cloudflare Pages Functions             │
              │  - Native edge runtime (V8 Engine)               │
              │  - Zero-cold-start compute nodes                 │
              │  - Directly executes Next.js Edge Server routes  │
              └────────────────────────┬─────────────────────────┘
                                       │
                  ┌────────────────────┼────────────────────┐
                  ▼                    ▼                    ▼
       ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
       │  Cloudflare D1   │ │  Cloudflare KV   │ │  Cloudflare R2   │
       │ (Distributed SQL)│ │ (High-Speed Cache)│ │  (Blob Storage)  │
       └──────────────────┘ └──────────────────┘ └──────────────────┘
```

### 1.1 Edge-First Execution Paradigm
- **Edge Deployment Target:** Hosted on **Cloudflare Pages**, with server-side computations compiling to **Cloudflare Workers** (using Pages Functions).
- **Runtime Compute Engine:** All dynamic server routes (`/api/*`) are configured to execute strictly on the **Edge Runtime** (lightweight V8 isolate engines) rather than standard Node.js containers. This removes cold-start overhead completely.
- **Database Proximity:** Relational SQL queries execution runs against Cloudflare D1 databases sitting directly within the localized edge-compute container.

---

## 2. Feature-Based Directory Architecture

We avoid general, unstructured folder schemes like `/src/*` that mix concerns. Cole.dev implements a strict, modular **Feature-Based Folder Structure** that ensures high maintainability and code clarity.

```
/
├── app/                          # Next.js App Router (Layouts & fallbacks)
│   ├── globals.css               # Clean Tailwind imports (Tailwind v4)
│   ├── layout.tsx                # Font imports & global state providers
│   ├── page.tsx                  # Master Page Orchestrator (Landing)
│   └── api/                      # Edge Server-Side Route Proxies
│       ├── gemini/chat/          # Grounded Assistant endpoint
│       ├── search/               # Search indexing API
│       └── contact/              # Secure mailer relay
├── features/                     # Self-contained business domains
│   ├── dashboard/                # Central grid layouts, Telemetry
│   ├── projects/                 # Systems details, Interactive D3 Maps
│   ├── notebook/                 # Editorial reading components, essays
│   ├── timeline/                 # ChronoTrajectory visual rails
│   └── assistant/                # Intelligent terminal, chat mechanics
├── components/                   # Domain-agnostic UI blocks (Atomic)
│   └── ui/                       # Clean buttons, inputs, dialog containers
├── hooks/                        # Global reactive hooks (useMobile, useScroll)
├── lib/                          # Utility libraries, Drizzle database config
│   ├── gemini.ts                 # Lazy-initialized Google Gen AI SDK
│   └── utils.ts                  # Tailwind-merge helpers
├── docs/                         # Architecture, product, and strategy logs
├── package.json                  # Managed dependency configuration
└── metadata.json                 # Core application configuration settings
```

---

## 3. Deployment & CI/CD Pipeline

To maintain reliable, zero-downtime shipping cycles, we employ an automated Git-Ops deployment strategy.

```
[ Git Push to Main ] ──> [ GitHub Actions Runner ]
                                │
                                ├──> 1. TypeScript & ESLint Audits
                                ├──> 2. Node.js Production Build Test
                                └──> 3. Cloudflare Pages Deploy Action
                                             │
                                             └──> Edge Deployment Complete (sub-2s)
```

1. **GitHub Actions Workflow:**
   - On every pull request or push to `main`, a headless action runner spins up.
   - Run sequence: `npm run lint` $\rightarrow$ `npm run build` (validates TypeScript types and compile targets).
2. **Atomic Edge Routing Preview:**
   - Successful builds trigger the Cloudflare Pages deploy action.
   - Generates isolated staging URLs for QA review.
   - Direct merge to `main` completes atomic edge deployment routing switches in under 2 seconds.

---

## 4. API, Security & Caching Protocols

### 4.1 Server-Side Gemini API Proxy Guard
- **API Key Security:** The Google Gemini API key (`GEMINI_API_KEY`) is a secure environment variable configured directly in Cloudflare Secrets. It is **never** exposed to the client browser.
- **Proxy Endpoint:** All client communication with the AI models travels through the secure `/api/gemini/chat` Edge route, enforcing strict request validation.

### 4.2 Multi-Layer Security Architecture
- **Web Application Firewall (WAF):** Cloudflare WAF active, screening incoming payloads to prevent SQL injection, cross-site scripting (XSS), and automated bot scanning.
- **Content Security Policy (CSP):** Strict HTTP headers injected, restricting scripts and frame connections exclusively to trusted sources (e.g., self, Google APIs, Cloudflare CDN).
- **IP Rate Limiting:** Enforces maximum thresholds on `/api/gemini/chat` and `/api/contact` (e.g., maximum 10 requests per minute per IP) leveraging lightweight, low-latency Cloudflare KV tracking.

### 4.3 Multi-Tier Caching Strategy
- **Static Assets:** Custom HTTP header configuration on R2 assets and Next.js static builds: `Cache-Control: public, max-age=31536000, immutable` (caches files at local browser levels permanently).
- **Incremental Static Regeneration (ISR):** Editorial notebook posts and system details are compiled as static HTML during deployment. Upon database modifications, API webhooks invalidate specific Edge paths, updating the cache in the background without affecting performance.

---

*This global technical architecture guarantees zero cold starts, enterprise-grade data security, and exceptional performance, proving our mastery over distributed edge technologies.*
