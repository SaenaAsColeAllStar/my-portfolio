# Cole.dev — Interactive Motion & Physics Specification

This document defines the comprehensive **Motion Language** and physical animation parameters for Cole.dev. Compiled by the Lead Motion Designer, Frontend Architect, and Performance Engineer, it ensures that every transition, scroll interaction, and hover behavior is purposeful, fluid, and optimized for sub-millisecond execution.

---

## 1. Core Motion Philosophy

Motion is not decorative embellishment; it is **narrative feedback**. In a "Digital Mind," motion represents the friction, weight, and propagation of electrical synapses and logic states.

### 1.1 The Principles of Intentional Motion
- **No Floating Clutter:** Never animate an element simply to draw attention to it unless it actively responds to user input or guides immediate task-completion hierarchy.
- **Physics over Math:** Avoid artificial, linear, or mathematical ease curves (e.g., `ease-in-out` curves). All structural animations MUST use spring physics. Springs simulate real-world mass, stiffness, and friction, yielding highly organic, responsive, and predictable transitions.
- **Asymmetric Pacing:** Element entrances (revealing content) are fast, sharp, and highly responsive. Element exits (dismissing content) are smooth, quiet, and slightly slower to let the eye adjust.

---

## 2. Global Animation Rules & Spring Presets (using `motion`)

We define three standardized spring presets. These are the building blocks of all interactive motion, mapped directly to their performance and sensory outcomes.

### 2.1 The Preset Library (JSON Specs for Framer Motion)

```typescript
// 1. The Synaptic Snap (High stiffness, low damping)
// Used for immediate actions: button clicks, hover feedback, active selections.
export const snapSpring = {
  type: "spring",
  stiffness: 380,
  damping: 24,
  mass: 0.8
};

// 2. The Fluent Shift (Medium stiffness, balanced damping)
// Used for larger layout transitions: slide-out panels, split-screen expansions, route shifts.
export const fluentSpring = {
  type: "spring",
  stiffness: 240,
  damping: 28,
  mass: 1.0
};

// 3. The Ambient Float (Low stiffness, high damping)
// Used for subtle, background animations: neural network breathing, reading trackers.
export const ambientSpring = {
  type: "spring",
  stiffness: 40,
  damping: 18,
  mass: 1.2
};
```

### 2.2 Entry Sequence (The "Synaptic Bloom")
- **Action:** Staggered content mounting on page load.
- **Implementation:** Grid lines draw first, followed by structural container bounding boxes, and finally text and interactive elements.
- **Parameters:**
  ```typescript
  export const entranceContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.1
      }
    }
  };

  export const entranceItemVariants = {
    hidden: { y: 12, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: fluentSpring
    }
  };
  ```

---

## 3. Micro-Hover & Tactile Rules

Every interactive element must provide instant physical confirmation of its interactability without distorting the layout.

### 3.1 Card Hover (Interactive Systems & Articles)
- **Visual Mechanics:** Upon hover, the target card scales up slightly, shifts upward, and deepens its border contrast. Adjacent cards do NOT move.
- **Motion Params:**
  ```typescript
  export const cardHover = {
    hover: {
      y: -4,
      scale: 1.015,
      borderColor: "rgba(15, 82, 186, 0.15)", // Sapphire blue tint
      boxShadow: "rgba(0, 0, 0, 0.02) 0px 4px 6px, rgba(15, 82, 186, 0.04) 0px 8px 24px",
      transition: snapSpring
    }
  };
  ```

### 3.2 Magnetic Hover Snapping (Buttons & Floating Dock Icons)
- **Visual Mechanics:** When the cursor moves within a 20px radius of a primary CTA or dock icon, the icon "pulls" toward the cursor, locking its center point with offset dampening.
- **Parameters:** Motion limit capped at `8px` translation maximum on both X and Y axes to prevent the element from detaching from its baseline visual row.

### 3.3 The Sapphire Synapse Glow (Active States)
- **Action:** Clicking a node in an architecture diagram or a link in the floating dock.
- **Visuals:** A microscopic radial pulse expansion (Sapphire blue, `#0F52BA`) spreads outward from the focal center, fading to transparent within 300ms.

---

## 4. Cinematic Scroll-Driven Rules

Cole.dev uses scroll positions as an active coordinate system, shifting dashboard states organically.

### 4.1 Chrono-Rail Construction (Timeline Scroll)
- **Action:** The vertical timeline rail draws itself downwards in direct alignment with viewport scroll progress.
- **Implementation:** Leverages `useScroll` from `motion` to map `scrollProgress.y` directly to CSS `scaleY`.
- **Active Node Highlight:** When a chronological block enters the vertical window range `[y: 40%, y: 60%]`, the node scale increases from `0.8x` to `1.2x`, and the text contrast transitions from `#6B6A65` to `#111110` with zero visual delay.

### 4.2 Dashboard Parallax Bounds
- **Constraints:** Background structural coordinate lines move at `0.15x` scroll velocity, while primary panels move at `1.0x`. This provides subtle, immersive architectural depth without creating vertigo or lagging layouts.

---

## 5. Panel Transitions & The "Glass Box" Split Screen

Transitioning into detail modes (clicking a system case study or notebook article) shifts the interface grid instead of opening a traditional blocking loader.

```
+───────────────────────────+          +───────────────────────────+
| [   D A S H B O A R D   ] |          |  [ MAP ]  |  [ DETAILS ]  |
|                           |          |           |               |
| +───+  +───+  +───+  +───+ |  Click   | +───────+ | +───────────+ |
| |   |  |   |  |   |  |   | | ───────> | | SVG   | | | Markdown  | |
| +───+  +───+  +───+  +───+ |  fluent  | | Node  | | | Document  | |
|                           |  Spring  | | Map   | | | Read-Mode | |
| [     FLOATING DOCK     ] |          | +───────+ | +───────────+ |
+───────────────────────────+          +───────────────────────────+
```

### 5.1 The Grid Dissolve Sequence
1. **Trigger:** Click on case study.
2. **Phase 1 (Fade & Compress):** The surrounding grid items (other projects, real-time metrics) fade down (`opacity: 0`) and compress horizontally into the nearest margins over 150ms.
3. **Phase 2 (Split-Screen Bloom):** The selected card expands. It splits down the center line—the Left Panel sliding in from the left margin with the Interactive SVG Architecture Diagram, and the Right Panel sliding in from the right margin with the clean markdown document.
4. **Transition Physics:** Uses `fluentSpring` to ensure the panels slide into position with absolute fluid precision, maintaining a 60fps framerate.

---

## 6. 3D & Vector Spatial Interactions (The Neural Mind)

Integrating WebGL or Spline can represent a major performance bottleneck if not managed strictly.

### 6.1 Interactive Vector Neural Cluster (Preferred Lightweight Method)
- **Method:** Instead of loading a massive heavy 3D WebGL engine immediately on landing, Cole.dev implements a high-performance, dynamic SVG coordinate cluster.
- **Visuals:** 12-16 node points mapped to dynamic React state arrays. 
- **Cursor Tracking:** The SVG nodes use `useMotionValue` to track cursor coordinates, translating coordinates dynamically using physics-based offset loops.
- **Hover Physics:** Approaching a node point pushes adjacent coordinates away dynamically, returning to center positions organically with spring relaxation once the cursor departs.

### 6.2 Lazy Loaded 3D Assets (Optional Fallback)
- **Constraint:** If Spline or heavy WebGL canvases are used, they are strictly locked behind lazy loading gates using `next/dynamic`.
- **Loading Gate:** They only load after the primary interactive grid achieves full layout stability (the landing sequence finishes).
- **Static Vector Placeholder:** A beautiful, high-contrast, static SVG blueprint of the neural node is loaded immediately. The WebGL container fades over the top seamlessly once loaded.

---

## 7. Performance & Quality Constraints

A portfolio that stutters during transitions fails to prove engineering caliber.

### 7.1 The Frame Budget & Constraints
- **Target Frame Rate:** Stable **60fps** on high-resolution displays, **120fps** on ProMotion displays.
- **GPU Acceleration:** All physical coordinate animations MUST limit modifications strictly to `transform` (utilizing CSS properties `translate3d`, `scale`, `rotate`) and `opacity`. Modifying structural layout triggers (e.g., animating `width`, `height`, `top`, `left`, `margin`) is strictly forbidden as it forces full browser layout recalculations.
- **Will-Change Strategy:** Elements entering fluid transitions use the `will-change: transform, opacity` layer indicator to force browser composite scheduling, removing any microscopic stutter on entering frames.
- **Interaction Debouncing:** Cursor tracking systems are throttled/debounced via `requestAnimationFrame` loops to prevent thread thrashing.

---

## 8. Accessible Motion Guidelines (WCAG AA)

We protect vestibular accessibility. Motion must adapt gracefully to user settings.

### 8.1 Motion Customization & Reduced Motion Hook
- **The Media Query Trigger:** Cole.dev automatically respects the system setting `prefers-reduced-motion`.
- **Behavior Shift:** When reduced motion is requested, all translation animations (sliding, layout shifting, scaling, coordinate offsets) are automatically converted into **simple, instantaneous opacity fades** (`0.1s duration`).
- **Implementation:**
  ```typescript
  import { useReducedMotion } from "motion/react";

  export function useAdaptiveAnimation() {
    const shouldReduceMotion = useReducedMotion();
    
    return {
      transition: shouldReduceMotion ? { duration: 0.1 } : fluentSpring,
      variants: {
        hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 12 },
        visible: { opacity: 1, y: 0 }
      }
    };
  }
  ```

---

*This Motion System playbook establishes the physical feeling of Cole.dev. Every interaction, transition, and spring parameter written in our React modules will strictly follow these formulas.*
