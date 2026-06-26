# Cole.dev — Physical Implementation Roadmap

This document establishes the comprehensive **Implementation Planning & Milestones** for Cole.dev (Phase 14). Formulated by the Technical Engineering Manager, it divides the codebase construction into isolated, testable milestones to ensure rapid, high-quality development.

---

## Milestone 01: Core Workspace & Layout Scaffold

- **Goal:** Set up the unified Next.js App Router scaffolding, configure custom typography, integrate tailwind, and build the floating global navigation dock.
- **Priority:** Critical (Blocker)
- **Difficulty:** Low (★★☆☆☆)
- **Estimated Time:** 1 Day
- **Dependencies:** None
- **Deliverables:**
  - Standard Next.js structure with global font definitions (`Space Grotesk`, `Inter`, `JetBrains Mono`).
  - Core layout routing system at `/` managing active viewport states via URL query parameters.
  - Floating `NavigationDock` component with spring magnification.
- **Definition of Done:**
  - App builds successfully without TypeScript or linter warnings.
  - Users can press navigation buttons to transition between query parameters (`?view=dashboard` $\rightarrow$ `?timeline=true`) with smooth URL synchronization.

---

## Milestone 02: Dashboard Grid & Adaptive Visuals

- **Goal:** Construct the main landing dashboard grid layout, build static system showcase cards, and integrate the cursor-following neural cluster.
- **Priority:** High
- **Difficulty:** Medium (★★★☆☆)
- **Estimated Time:** 2 Days
- **Dependencies:** Milestone 01
- **Deliverables:**
  - Multi-column dashboard layout responsive across mobile, tablet, and widescreen.
  - `HeaderBrand` featuring real-time connection latency telemetry.
  - Interactive `NeuralSynapseCanvas` drawing an organic SVG connection net.
  - `ProjectShowcaseGrid` rendering core case study card shells.
- **Definition of Done:**
  - No viewport styling breaks between 320px and 1920px widths.
  - The SVG neural node net dynamically updates coordinates on cursor movement at a locked 60fps frame budget, and automatically falls back to static layouts under Reduced Motion configurations.

---

## Milestone 03: The "Glass Box" Split Case Study Overlay

- **Goal:** Build the overlay system panel that splits the screen upon clicking a project, displaying interactive node blueprints and markdown breakdowns.
- **Priority:** High
- **Difficulty:** High (★★★★☆)
- **Estimated Time:** 3 Days
- **Dependencies:** Milestone 02
- **Deliverables:**
  - Dual-panel layout (`CaseStudyOverlay`) integrating sliding transitions via `fluentSpring`.
  - SVG Node Topology Mapper (`SVGArchitectureViewer`) connecting edge nodes dynamically.
  - Markdown content renderer with custom copyable code block containers and Drizzle schema tabs.
- **Definition of Done:**
  - Clicking on a bento system card transitions the homepage into the split layout smoothly.
  - SVG node paths highlights on hover. Markdown text displays correctly with appropriate contrast ratios.

---

## Milestone 04: The Technical Notebook & ChronoTrajectory

- **Goal:** Create the single-column focused notebook reader layout and implement the scroll-driven vertical timeline tracker.
- **Priority:** Medium
- **Difficulty:** Medium (★★★☆☆)
- **Estimated Time:** 2 Days
- **Dependencies:** Milestone 01
- **Deliverables:**
  - High-contrast reader container (`IntellectNotebook`) optimized for editorial legibility.
  - Scroll-linked chronological line (`ChronoTrajectory`) tracking vertical document progression.
  - Milestone entry rows sliding inward sequentially based on viewport bounds.
- **Definition of Done:**
  - Long text reading frames provide sufficient contrast and generous reading columns.
  - Timeline line scales downward precisely matching scroll percentages.

---

## Milestone 05: Grounded Intelligent Terminal (Virtual Cole)

- **Goal:** Set up the server-side `/api/gemini/chat` router proxy using the `@google/genai` SDK, and build the floating terminal chat console with citation chip handling.
- **Priority:** High
- **Difficulty:** High (★★★★☆)
- **Estimated Time:** 3 Days
- **Dependencies:** Milestone 03, Milestone 04
- **Deliverables:**
  - Edge-compatible API route fetching stream responses with pre-grounded local markdown contexts.
  - Minimal floating terminal interface (`IntelligentTerminal`) supporting prompt inputs and streaming logs.
  - Custom markdown tag parser rendering active navigation chips (e.g., clicking references opens the target project).
- **Definition of Done:**
  - Chat streaming output behaves correctly without buffering issues.
  - Virtual Cole successfully rejects off-topic prompts and references provided local document schemas accurately.

---

## Milestone 06: Search & Command Palette Modal (`Cmd+K`)

- **Goal:** Implement the keyboard-driven global overlay modal for semantic keyword search and immediate administrative shortcut routing.
- **Priority:** Medium
- **Difficulty:** Medium (★★★☆☆)
- **Estimated Time:** 2 Days
- **Dependencies:** Milestone 01
- **Deliverables:**
  - Frosted backdrop command dialog modal responsive to global hotkeys (`Cmd+K` / `Ctrl+K`).
  - Search index system traversing across all projects, essays, and chronological logs.
- **Definition of Done:**
  - Triggering hotkey toggles the modal within 100ms.
  - Navigating search items using keyboard arrow keys and `Enter` works flawlessly without losing input focus.

---

## Milestone 07: Distributed Edge Database Sync (D1/KV/R2)

- **Goal:** Initialize the Drizzle ORM mappings, configure Cloudflare D1 SQL schemas, set up Cloudflare KV cache boundaries, and connect S3-compatible R2 storage paths.
- **Priority:** Medium
- **Difficulty:** High (★★★★☆)
- **Estimated Time:** 3 Days
- **Dependencies:** Milestone 03, Milestone 04, Milestone 05
- **Deliverables:**
  - Local SQLite / production D1 schema definitions with relational joins.
  - Key-Value namespace maps storing RAG grounding contexts and latency metrics.
  - File upload controller linking direct drag-and-drop actions to Cloudflare R2 blob buckets.
- **Definition of Done:**
  - Core tables are provisioned, migrated, and accessible via the ORM layer.
  - API requests successfully read and write to D1, warming corresponding KV caching indexes in real time.

---

## Milestone 08: Administrative CMS Panel

- **Goal:** Build the private administrative editing console with markdown writing canvases, dynamic node map designers, and edge redirection management forms.
- **Priority:** Low
- **Difficulty:** High (★★★★☆)
- **Estimated Time:** 4 Days
- **Dependencies:** Milestone 07
- **Deliverables:**
  - Secure login interface using cookie-based session verification.
  - Rich editor workspace with side-by-side node coordination panels and R2 asset drops.
  - SEO configuration inputs and Edge 301 redirection manager tables.
- **Definition of Done:**
  - Editing metadata, categories, or schemas and clicking `Publish` immediately saves changes to D1 and synchronizes Virtual Cole's KV indices.
  - Dynamic redirect middleware intercepts routes at the Edge and returns 301 statuses under 5ms.

---

## Milestone 09: System Audit, Polishing & Production Deployment

- **Goal:** Complete a comprehensive quality audit, run Lighthouse performance testing, fix WCAG color contrast issues, and deploy the production-ready code to Cloudflare Pages.
- **Priority:** High
- **Difficulty:** Medium (★★★☆☆)
- **Estimated Time:** 2 Days
- **Dependencies:** All Milestones
- **Deliverables:**
  - Fully production-optimized code bundles with route chunking and lazy-loaded assets.
  - Perfect accessibility compliance across all components.
  - Automated deployment pipeline through GitHub Actions to Cloudflare Pages.
- **Definition of Done:**
  - Lighthouse audit scores reach 98-100 across Performance, SEO, and Accessibility on both desktop and mobile.
  - Production URL loads cleanly worldwide, operating without any console or network failures.

---

*This roadmap isolates all physical deliverables and definitions of done, ensuring a clean, predictable construction process from scaffold to production launch.*
