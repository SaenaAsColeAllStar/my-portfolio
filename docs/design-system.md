# Cole.dev — UI/UX Design System Specification

This document defines the comprehensive **Design System** and visual standards for Cole.dev. It serves as the physical specification for all UI components, spacing scales, typography pairings, border/shadow treatments, and responsive layouts.

---

## 1. Grid & Layout Architecture

Cole.dev is engineered on a highly structured, rigid grid system that mimics a high-grade technical drafting blueprint. This grounds the interface and provides consistent alignment.

### 1.1 Master Grid Guidelines
- **Outer Canvas:** A full-viewport container (`min-h-screen`) framed by a 1px solid border offset (`m-4 md:m-6`). This margins the active viewport, creating an intentional floating picture-frame layout.
- **The Core Columns:** A flexible grid layout based on 12-columns:
  - **Desktop (>= 1280px):** 12-column grid, `gap-6` (24px).
  - **Tablet (768px - 1023px):** 6-column grid, `gap-4` (16px).
  - **Mobile (< 768px):** 1-column layout, `gap-4` (16px).
- **Max-Width Cap:** The grid is bounded inside a `max-w-7xl` container (1280px) and centered horizontally (`mx-auto`) to prevent excessive line lengths on ultra-wide displays.

### 1.2 Panel Layout Dimensions
- **Standard Card Aspect Ratios:** Prefer square (`1:1`) or widescreen (`16:9` / `2:1`) boxes. Avoid random heights; align everything using consistent flex-row structures or explicit row heights to maintain baseline rhythm.

---

## 2. Typography System & Hierarchy

Typography is our primary design material. We establish typographic contrast by mixing highly geometric tech-sans with a highly readable reading-sans, and a clean code-mono.

### 2.1 The Type Scale
We employ a typographic scale with tight tracking on headings to mimic high-end product engineering lookups.

| Token | Class / Style | Size | Weight | Tracking | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`display`** | `font-sans text-4xl md:text-5xl` | 36px / 48px | Medium (500) | `-0.04em` | Hero Headings |
| **`h1`** | `font-sans text-2xl md:text-3xl` | 24px / 30px | Medium (500) | `-0.03em` | Panel titles, Section headers |
| **`h2`** | `font-sans text-lg md:text-xl` | 18px / 20px | Medium (500) | `-0.02em` | Sub-sections, Card headers |
| **`body-primary`**| `font-sans text-base` | 16px | Regular (400) | `-0.011em` | Standard reading, Article bodies |
| **`body-secondary`**| `font-sans text-sm`| 14px | Regular (400) | `-0.006em` | Card copy, Labels, Secondary descriptions |
| **`mono-label`** | `font-mono text-xs` | 12px | Regular (400) | `normal` | Metadata, Code, Latency logs, Schemas |
| **`mono-micro`** | `font-mono text-[10px]` | 10px | Medium (500) | `0.05em` (caps)| Small system tags, status indicators |

---

## 3. Spacing & Radius Scales

We avoid random spacing values to maintain strict design rhythm. Every margin, padding, and gap must conform to our numeric scale.

### 3.1 Spacing Scale (8pt Grid)
- **`space-1` (4px):** Intracomponent elements (e.g., status dot beside a text label).
- **`space-2` (8px):** Tight text-cluster grouping, tags inside a flex container.
- **`space-3` (12px):** Button interior horizontal padding, tight cards.
- **`space-4` (16px):** Standard card padding, small screen gaps, inline lists.
- **`space-6` (24px):** Large card padding, dashboard gap, standard margins.
- **`space-8` (32px):** Section vertical spacing, panel offsets.
- **`space-12` (48px):** Hero section top padding, massive editorial negative space.

### 3.2 Corner Radii
We use minimal, crisp corners. Large, rounded circles look childish and conflict with the "Digital Mind" concept.
- **`radius-sm` (4px):** Badges, tiny tags, syntax blocks.
- **`radius-md` (8px):** Buttons, dropdowns, inputs, command palette lines.
- **`radius-lg` (12px):** Standard dashboard cards, split-screen panels, modals.
- **`radius-full` (9999px):** Round status indicators, interactive dock wrappers.

---

## 4. Element Components & Interactive States

Each component is styled for a warm light canvas (`#FBFBFA`) with crisp white (`#FFFFFF`) surfaces.

### 4.1 Cards & Panels (The "Glass Box")
- **Standard Card:**
  - Background: `#FFFFFF`
  - Border: `1px solid rgba(17, 17, 16, 0.05)` (ultra-thin slate border)
  - Shadow: `rgba(0, 0, 0, 0.01) 0px 1px 2px, rgba(0, 0, 0, 0.02) 0px 4px 12px`
- **Active / Hover State Card:**
  - Border transitions to: `1px solid rgba(15, 82, 186, 0.15)` (Sapphire blue tint)
  - Shadow shifts to slightly deeper elevation: `rgba(0, 0, 0, 0.02) 0px 4px 6px, rgba(15, 82, 186, 0.04) 0px 8px 24px`
  - Position lifts smoothly on Y-axis by `-2px` using spring-based motion.

### 4.2 Buttons
We use three distinct button weights:
1. **Primary Button (The Solid Action):**
   - Background: `#111110` (deep charcoal)
   - Font: `font-sans text-sm font-medium text-[#FBFBFA]`
   - Hover State: Background changes to `#2B2B28`, subtle forward translation.
2. **Secondary Button (The Outline Option):**
   - Background: `#FFFFFF`
   - Border: `1px solid rgba(17, 17, 16, 0.1)`
   - Font: `font-sans text-sm font-medium text-[#111110]`
   - Hover State: Background shifts to `#FBFBFA`, border deepens to `rgba(17, 17, 16, 0.25)`.
3. **Tertiary Button (The Interactive Link):**
   - Background: Transparent
   - Font: `font-sans text-sm font-medium text-[#0F52BA]` (Sapphire Blue)
   - Icon: Small arrow `→` offset to slide horizontal by `3px` on hover.

### 4.3 Input Fields & Forms
Inputs must look crisp, clean, and resemble high-grade mechanical fields.
- **The Text Line:**
  - Background: `#FFFFFF`
  - Border: `1px solid rgba(17, 17, 16, 0.08)`
  - Typography: `font-sans text-sm text-[#111110] placeholder-[#8C8B86]`
  - Focus State: Border transitions to `#0F52BA` (Sapphire Blue), accompanied by a soft, zero-blur blue box shadow.

---

## 5. System Chromes & Overlays

### 5.1 The Command Bar Modal (`Cmd+K`)
- **Structure:** Centered floating container, bounded within a `w-full max-w-xl` frame.
- **Glass Panel backdrop:** Frosted glass overlay behind the modal (`backdrop-blur-md` with `bg-gray-500/10` filter).
- **Interior List:** Items are organized under clear category labels in uppercase monospace (`PROJECTS`, `MEMOS`, `COMMANDS`). Active item is highlighted with soft background `#FBFBFA` and a left-aligned sapphire bookmark line (`w-1 h-4 bg-[#0F52BA]`).

### 5.2 The Master Floating Dock
- **Layout:** Anchored `bottom-6 left-1/2 -translate-x-1/2`.
- **Styling:** Highly compact, single-row navigation bar. Solid white background with a frosted backing `backdrop-blur-md bg-white/80`.
- **Spring Scale Feedback:** Icons scale up to `1.15x` relative to adjacent nodes, following frictionless physics.

---

## 6. Strict Accessibility (WCAG AA+ Compliant)

Accessibility is baked directly into the design, not added on.
- **Color Contrast:** We strictly avoid low-contrast gray-on-gray text. Our secondary body text (`#6B6A65` on `#FFFFFF` or `#FBFBFA`) maintains a contrast ratio exceeding **4.5:1**.
- **Keyboard Navigation:** Every active item (`button`, `a`, `input`, command list option) must have a clearly visible, custom focus state: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F52BA]`.
- **Semantic Anchors:** Use correct semantic HTML elements (`<header>`, `<nav>`, `<main>`, `<article>`, `<footer>`) with descriptive `aria-label` tags for screen-reader legibility.
- **No Reliance on Color Alone:** Active nodes in diagrams or warning text must include clear typographic markers (e.g., status text or distinct symbols) alongside color shifts.

---

*This UI Specification establishes the exact visual parameters of Cole.dev. All upcoming layout templates, components, and interactive frames must conform to this playbook.*
