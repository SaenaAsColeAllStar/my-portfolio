# Cole.dev — Frontend Component Architecture Specification

This document details the complete **Component Architecture** and structural blueprint for Cole.dev (Phase 09). Formulated by the Senior Frontend Architect, it defines the responsibilities, hierarchy, state interfaces, and interaction mechanisms for all modular UI blocks.

---

## 1. Component Hierarchy Map

The application operates as a single-page orchestrator with a strict unidirectional data flow. Below is the structural hierarchy of the frontend architecture:

```
AppLayout (app/layout.tsx)
 └── PageOrchestrator (app/page.tsx)
      ├── NavigationDock (Floating global navbar)
      ├── CommandPaletteModal (Cmd+K global search & command overlay)
      │
      ├── LandingDashboard (Standard Grid View)
      │    ├── HeaderBrand (Minimal logo/signet & real-time telemetry)
      │    ├── HeroSection (Display typography, key statements, & main actions)
      │    │    └── NeuralSynapseCanvas (Dynamic cursor-following SVG neuron cluster)
      │    ├── TechStackCluster (Interactive tech-metadata visualization)
      │    └── ProjectShowcaseGrid (Compact bento layout of systems)
      │         └── SystemCard (Aesthetic project containers)
      │
      ├── CaseStudyOverlay (The "Glass Box" Split Screen - ?project=[slug])
      │    ├── SVGArchitectureViewer (Interactive, node-connecting D3 map)
      │    └── EditorialNarrativeFrame (Scrollable styled markdown renderer)
      │         └── SchemaInspectorTab (Code-highlighted database/API structures)
      │
      ├── IntellectNotebook (Long-form technical logs - ?notebook=[slug])
      │    └── ReaderFrame (Single-column, high-contrast, scroll-paced editorial)
      │
      ├── ChronoTrajectory (Chronological timeline - ?timeline=true)
      │    └── TimelineRail (Vertical line tracking scroll heights)
      │         └── MilestoneNode (Expandable chronological accomplishment rows)
      │
      ├── IntelligentTerminal (Interactive AI Assistant console)
      │    └── TerminalInterface (Command input, token-steamed logs, citations)
      │
      └── ContactConsole (Direct conversion pane - ?contact=true)
           └── SchedulingModal (Direct custom calendar event hook)
```

---

## 2. Component Specifications

### 2.1 NavigationDock (The Floating Global Navbar)
- **Primary Responsibility:** Orchestrate the core active view of the master page canvas, managing direct routing/state transitions.
- **Hierarchy:** Direct child of `PageOrchestrator`. Floating overlay on top of all views.
- **State & Props:**
  ```typescript
  interface INavigationDockProps {
    currentView: "dashboard" | "project" | "notebook" | "timeline" | "assistant";
    onViewChange: (targetView: string) => void;
  }
  ```
- **Interaction & Physics:**
  - Placed at `bottom-6 left-1/2 -translate-x-1/2`.
  - Employs a dynamic hover magnification factor. Moving the cursor near the icons smoothly expands the targeted item using the `snapSpring` physics model.

---

### 2.2 HeaderBrand & HeroSection
- **Primary Responsibility:** Communicate Cole’s professional positioning, render the high-contrast display introduction, and draw the interactive neural SVG backdrop.
- **Hierarchy:** Top component inside the `LandingDashboard`.
- **Children:** `NeuralSynapseCanvas`.
- **Interaction & Physics:**
  - **NeuralSynapseCanvas:** Translates screen-space mouse coordinates ($X, Y$) into vector displacement points, applying dampening on a 15-node SVG link net. Underreduced motion settings, the cursor tracking is deactivated, displaying a crisp, stationary technical blueprint.

---

### 2.3 ProjectShowcaseGrid & SystemCard
- **Primary Responsibility:** Render available systems in a clean bento grid, showing core key metadata, categories, and metrics before entering a full case study.
- **Hierarchy:** Mid-section of `LandingDashboard`.
- **Children:** `SystemCard[]`.
- **State & Props:**
  ```typescript
  interface ISystemCardProps {
    project: IProject;
    onSelect: (slug: string) => void;
  }
  ```
- **Interaction & Physics:**
  - Hovering over a card shifts its boundary slightly upward by `-4px` using spring-based transformations, simultaneously showing a micro-glow border in sapphire blue. Clicking triggers the split-screen layout transformation.

---

### 2.4 CaseStudyOverlay (The "Glass Box")
- **Primary Responsibility:** Divide the screen into a dual-column interface, rendering the zoomable SVG system blueprint on the left and the complete, technical engineering breakdown on the right.
- **Hierarchy:** Conditional overlay triggered on `?project=[slug]`.
- **Children:** `SVGArchitectureViewer`, `EditorialNarrativeFrame`.
- **State & Props:**
  ```typescript
  interface ICaseStudyOverlayProps {
    project: IProject;
    onClose: () => void;
  }
  ```
- **Interaction & Physics:**
  - **SVGArchitectureViewer (Left Column):** Uses SVG coordinate definitions. Hovering over a node (e.g., "Cache Layer") isolates the connection lines, coloring them in vibrant sapphire, and displays a mini-metadata card explaining that micro-service's latency and technology.
  - **EditorialNarrativeFrame (Right Column):** Smooth scroll container with an active progress bar running at the header line. Includes copy-to-clipboard code highlights.

---

### 2.5 ChronoTrajectory (Timeline)
- **Primary Responsibility:** Map Cole’s experience chronologically along a vertical timeline rail, allowing technical leaders to trace historical execution.
- **Hierarchy:** Mounts under `/` when active.
- **Children:** `TimelineRail`, `MilestoneNode[]`.
- **Interaction & Physics:**
  - Traces scroll heights dynamically using `useScroll` from `motion`. The vertical single-pixel line extends downwards as the user scrolls.
  - Individual milestone blocks fade and slide horizontally inward when entering the central 40% vertical window of the screen.

---

### 2.6 IntelligentTerminal (Virtual Cole AI Assistant)
- **Primary Responsibility:** Provide a grounded, low-latency command prompt and chat interface for the user to query Cole’s skills and project documentation.
- **Hierarchy:** Floating overlay at the bottom-right corner.
- **State & Props:**
  ```typescript
  interface ITerminalState {
    query: string;
    messages: { role: "user" | "assistant"; text: string; citations?: string[] }[];
    isStreaming: boolean;
    terminalActive: boolean;
  }
  ```
- **Interaction & Physics:**
  - Opens via a minimal text query line or global key command.
  - On submit, text flows in stream-rendered chunks directly from `/api/gemini/chat`. Interactive buttons appear beside the reply to deep-link the user directly to the mentioned portfolio project or database schema.

---

### 2.7 CommandPaletteModal (`Cmd+K` Search)
- **Primary Responsibility:** Offer instant navigation across projects, articles, timeline milestones, and structural commands via a keyboard-first terminal modal.
- **Hierarchy:** Global overlay mounted at layout level.
- **Interaction & Physics:**
  - Fades and blurs behind content upon initialization (`backdrop-blur-md`).
  - Supports full keyboard navigation: `Up/Down` arrow keys translate list highlighting, and `Enter` triggers active navigation or command executions.

---

### 2.8 ContactConsole
- **Primary Responsibility:** Handle email copy states, scheduling calendar hooks, and direct message transmission without requiring full-page navigation.
- **Hierarchy:** Glides in from bottom margin on `?contact=true`.
- **Interaction & Physics:**
  - Uses the `fluentSpring` transition, sliding upwards like a mechanical sheet. 
  - Submitting a message fires a lightweight async POST request to `/api/contact`, displaying a clean success indicator with a spring-based layout shift.

---

*This modular Component Architecture guarantees structural alignment, robust type safety, and clean isolation of visual state across all layout frames on Cole.dev.*
