/**
 * @file page.tsx
 * @description Master Storytelling Page Orchestrator for Cole.dev.
 * Implements a guided technical narrative that takes visitors on an emotional
 * journey from curiosity to trust. Uses our premium Design System and edge-native platform.
 */
"use client";

import { Suspense, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, 
  ArrowRight, 
  Sparkles, 
  Cpu, 
  Network, 
  FileText, 
  GitBranch, 
  ShieldAlert,
  Play,
  RotateCw,
  Check,
  Database,
  Send,
  Server,
  AlertCircle
} from "lucide-react";

// Import navigation and features
import NavigationDock, { navigationViews, type NavigationView } from "@/components/navigation-dock";
import NeuralSynapseCanvas from "@/features/dashboard/neural-synapse-canvas";
import CaseStudyOverlay from "@/features/projects/case-study-overlay";
import IntellectNotebook from "@/features/notebook/intellect-notebook";
import ChronoTrajectory from "@/features/timeline/chrono-trajectory";
import VirtualColeAssistant from "@/features/assistant/virtual-cole-assistant";
import { isProjectSlug, type ProjectSlug, projectSummaries } from "@/features/projects/domain/project-catalog";

// Import our premium Design System primitives and motion tokens
import { Button } from "../src/shared/components/ui/button";
import { Card } from "../src/shared/components/ui/card";
import { GlassPanel } from "../src/shared/components/ui/glass-panel";
import { Grid } from "../src/shared/components/ui/grid";
import { Terminal } from "../src/shared/components/ui/terminal";
import { Canvas3D } from "../src/shared/lib/three/three-canvas";
import { useMagnetEffect, useParallaxVector } from "../src/shared/lib/motion/motion-tokens";
import { telemetry } from "../src/shared/lib/observability/observability-platform";

function isNavigationView(value: string | null): value is NavigationView {
  return Boolean(value && (navigationViews as readonly string[]).includes(value));
}

function Loader() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#FAF9F6] text-black dark:bg-[#0B0B0B] dark:text-white">
      <div className="flex flex-col items-center gap-3">
        <Activity className="h-6 w-6 animate-pulse text-[#D4AF37]" />
        <span className="font-mono text-xs text-text-mute tracking-wider">SYSTEM_BOOTING...</span>
      </div>
    </div>
  );
}

function PageContent() {
  const [currentView, setCurrentView] = useState<NavigationView>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get("view");
      if (isNavigationView(viewParam)) {
        return viewParam;
      }
    }
    return "dashboard";
  });
  
  const [selectedProjectSlug, setSelectedProjectSlug] = useState<ProjectSlug | null>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const projectParam = params.get("project");
      return isProjectSlug(projectParam) ? projectParam : null;
    }
    return null;
  });

  const [latency, setLatency] = useState("0ms");
  const [activeNode, setActiveNode] = useState<string>("ingest");
  const [activeSection, setActiveSection] = useState("arrival");

  // Parallax and physics vectors
  const parallaxGrid = useParallaxVector(0.03);
  const magnetTrace = useMagnetEffect(0.2);

  // IntersectionObserver for Narrative Timeline Scroll Spy
  useEffect(() => {
    if (currentView !== "dashboard") return;
    
    const sections = [
      "arrival",
      "identity",
      "pipeline",
      "philosophy",
      "projects",
      "disciplines",
      "telemetry",
      "assistant-preview",
      "contact-form"
    ];

    const observers = sections.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(id);
          }
        },
        { rootMargin: "-30% 0px -55% 0px" } // Triggers when section is centered in viewport
      );
      observer.observe(el);
      return { observer, el };
    });

    return () => {
      observers.forEach((obs) => {
        if (obs) obs.observer.unobserve(obs.el);
      });
    };
  }, [currentView]);

  // Real-time Latency Ticker & Sparkline generator
  const [latencyHistory, setLatencyHistory] = useState<number[]>([42, 45, 40, 48, 43, 44, 41, 46, 42, 45, 43, 47, 42, 44, 40]);
  useEffect(() => {
    const start = performance.now();
    const timer = setTimeout(() => {
      const end = performance.now();
      const currentVal = Math.round(end - start);
      setLatency(`${currentVal}ms`);
      telemetry.trackMetric("ping.latency", end - start);
    }, 45);

    // Random walk latency generator for sparkline
    const interval = setInterval(() => {
      setLatencyHistory((prev) => {
        const last = prev[prev.length - 1];
        const nextVal = Math.max(12, Math.min(68, last + (Math.random() - 0.5) * 8));
        return [...prev.slice(1), Math.round(nextVal)];
      });
    }, 2500);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  // --- Interactive Terminal Simulation States & Logic ---
  const initialAiLines = [
    "const query = 'edge database';",
    "const vector = await embed(query);",
    "const matches = await index.query(vector, { topK: 4 });",
    "if (matches[0].score < 0.62) {",
    "  return 'Knowledge Not Found';",
    "}"
  ];
  const [aiTerminalLines, setAiTerminalLines] = useState<string[]>(initialAiLines);
  const [aiRunning, setAiRunning] = useState(false);

  const runAiTerminal = () => {
    if (aiRunning) return;
    setAiRunning(true);
    let current = [...initialAiLines, "", "$ npx ts-node query.ts", "⚡ Initializing edge embedding..."];
    setAiTerminalLines(current);
    
    setTimeout(() => {
      current = [...current, "🔍 Query: 'edge database'", "✅ Vector similarity: 0.89 (Similarity threshold met)"];
      setAiTerminalLines(current);
    }, 700);

    setTimeout(() => {
      current = [...current, "📦 Hydrating context from Cloudflare D1...", "🤖 LLM Response: Grounded response synthesized successfully in 28ms."];
      setAiTerminalLines(current);
      setAiRunning(false);
    }, 1500);
  };

  const initialEdgeLines = [
    "export default {",
    "  async fetch(req, env) {",
    "    const cache = await env.KV.get(hash(req));",
    "    if (cache) return new Response(cache);",
    "    const response = await fetch(env.BACKEND);",
    "    return response;",
    "  }",
    "};"
  ];
  const [edgeTerminalLines, setEdgeTerminalLines] = useState<string[]>(initialEdgeLines);
  const [edgeRunning, setEdgeRunning] = useState(false);

  const runEdgeTerminal = () => {
    if (edgeRunning) return;
    setEdgeRunning(true);
    let current = [...initialEdgeLines, "", "$ wrangler dev --remote", "📡 Connecting to global edge sandbox..."];
    setEdgeTerminalLines(current);

    setTimeout(() => {
      current = [...current, "🌍 Warm start in 312 locations.", "✅ Gateway online. RTT = 12ms."];
      setEdgeTerminalLines(current);
    }, 700);

    setTimeout(() => {
      current = [...current, "📥 GET /api/projects -> KV Cache MISS", "📤 GET /api/projects -> KV Cache HIT (94.2% hit rate)"];
      setEdgeTerminalLines(current);
      setEdgeRunning(false);
    }, 1500);
  };

  const initialScribingLines = [
    "# ADR-014: Platform Decoupling",
    "Status: Approved",
    "Decision: Implement strict interface boundaries",
    "Consequences:",
    "- 100% Mockable test scopes",
    "- Seamless vendor replacements"
  ];
  const [scribingTerminalLines, setScribingTerminalLines] = useState<string[]>(initialScribingLines);
  const [scribingRunning, setScribingRunning] = useState(false);

  const runScribingTerminal = () => {
    if (scribingRunning) return;
    setScribingRunning(true);
    let current = [...initialScribingLines, "", "$ mkdocs build", "📄 Indexing technical architecture blueprints..."];
    setScribingTerminalLines(current);

    setTimeout(() => {
      current = [...current, "✅ Indexed 14 Architecture Decision Records (ADRs).", "✅ Hydrated 3 project PRDs."];
      setScribingTerminalLines(current);
    }, 700);

    setTimeout(() => {
      current = [...current, "🚀 Exporting markdown corpus to Cloudflare Vectorize...", "✨ Grounding database updated with 0 semantic gaps."];
      setScribingTerminalLines(current);
      setScribingRunning(false);
    }, 1500);
  };

  // --- Grounded AI Interrogation (Virtual Cole) Simulation Logic ---
  const [chatStep, setChatStep] = useState<"idle" | "thinking" | "streaming" | "done">("idle");
  const [displayedAnswer, setDisplayedAnswer] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const presetQuestions = [
    {
      q: "What is Cole's Edge database approach?",
      a: "Cole designs edge systems using Cloudflare D1 as the relational SQL core, coupled with Cloudflare KV namespaces for semantic caching. This architecture enables global read times of under 15ms by bypassing centralized database lookups. [Sources: Architecture Specs, ADR-009]",
    },
    {
      q: "Does Cole build production AI systems?",
      a: "Yes. Cole deploys secure Workers AI models (including Llama 3.1) coupled with Vectorize similarity indexes. He enforces strict cosine similarity scoring (threshold >= 0.62) to prevent AI model hallucinations. [Sources: AI Platform Specs, ADR-014]",
    },
    {
      q: "What is Cole's core technical stack?",
      a: "Cole's production stack comprises Cloudflare Workers, Next.js (App Router), TypeScript, Drizzle ORM, Vectorize, and Tailwind CSS. The entire ecosystem is structured for zero-cold-start edge execution. [Sources: Core Catalog, package.json]",
    }
  ];

  const triggerChatSimulation = (questionText: string, answerText: string) => {
    if (chatStep === "thinking" || chatStep === "streaming") return;
    setSelectedPreset(questionText);
    setChatStep("thinking");
    setDisplayedAnswer("");

    // Simulate vector search and RAG ingestion latency
    setTimeout(() => {
      setChatStep("streaming");
      let idx = 0;
      const interval = setInterval(() => {
        setDisplayedAnswer(answerText.substring(0, idx + 1));
        idx++;
        if (idx >= answerText.length) {
          clearInterval(interval);
          setChatStep("done");
        }
      }, 12); // Stream typing speed
    }, 1000);
  };

  const handleViewChange = (view: NavigationView) => {
    setCurrentView(view);
    const newUrl = `${window.location.pathname}?view=${view}`;
    window.history.pushState({ path: newUrl }, "", newUrl);
    telemetry.trackEvent({
      name: `view_changed_${view}`,
      category: "interaction",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCloseProject = () => {
    setSelectedProjectSlug(null);
    const newUrl = `${window.location.pathname}?view=${currentView}`;
    window.history.pushState({ path: newUrl }, "", newUrl);
  };

  const handleProjectSelect = (slug: string) => {
    if (!isProjectSlug(slug)) return;
    setSelectedProjectSlug(slug);
    const newUrl = `${window.location.pathname}?view=dashboard&project=${slug}`;
    window.history.pushState({ path: newUrl }, "", newUrl);
    telemetry.trackEvent({
      name: `project_viewed_${slug}`,
      category: "interaction",
    });
  };

  // Node contents for the Cognitive Framework section
  const cognitiveNodes: Record<string, { title: string; desc: string; metrics: string }> = {
    ingest: {
      title: "Edge Ingestion",
      desc: "Incoming API and HTTP client requests are received by Cloudflare Workers in 300+ global edge locations.",
      metrics: "RTT < 15ms | Latency Optimized",
    },
    cache: {
      title: "Semantic KV Cache",
      desc: "Checks query hashes against a Cloudflare KV namespace. Instantly returns cached SSE responses for similar historical queries.",
      metrics: "94.2% Hit Rate | 0ms LLM Latency",
    },
    rag: {
      title: "Grounded RAG Engine",
      desc: "Generates semantic embeddings and queries a Cloudflare Vectorize index, hydrating document chunks from a D1 database.",
      metrics: "Cosine Similarity | Grounded Context Only",
    },
    synthesis: {
      title: "Edge LLM Synthesis",
      desc: "Synthesizes final answers using Cloudflare Workers AI Llama 3.1, enforcing strict hallucination guardrails.",
      metrics: "32 tokens/sec | Grounded Verification",
    },
  };

  // Framer Motion Spring Transition Preset for scroll-reveal
  const sectionReveal = {
    initial: { opacity: 0, y: 35 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-12%" },
    transition: { type: "spring" as const, stiffness: 60, damping: 22 }
  };

  return (
    <div className="relative min-h-screen text-[#111111] dark:text-[#FFFFFF] flex flex-col justify-between overflow-x-hidden pb-32">
      {/* Interactive Neural Cluster background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <NeuralSynapseCanvas />
      </div>

      {/* Dynamic Grid Background Overlay with Parallax Offset */}
      <div 
        className="absolute inset-0 blueprint-grid-canvas pointer-events-none z-0 transition-transform duration-75"
        style={{
          transform: `translate3d(${parallaxGrid.x}px, ${parallaxGrid.y}px, 0)`,
        }}
      />

      {/* Elegant Header Brand Telemetry */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between border-b border-border-mute bg-background/20 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <span className="font-sans font-medium text-sm tracking-wider">C O L E . D E V</span>
          <span className="px-1.5 py-0.5 bg-gold/10 text-gold font-mono text-[9px] rounded font-bold">AI_ENGINEER</span>
        </div>

        {/* Real-time Telemetry HUD */}
        <div className="flex items-center gap-4 text-xs font-mono text-text-mute">
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>NODE: EDGE_SERVER_ACTIVE</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 border-l border-border-mute pl-4">
            <Activity className="w-3.5 h-3.5 text-gold" />
            <span>RTT: <span className="text-foreground font-semibold">{latency}</span></span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 border-l border-border-mute pl-4">
            <span>LOC: GLOBAL_EDGE</span>
          </div>
        </div>
      </header>

      {/* Floating Narrative Timeline Sidebar (Desktop Only) */}
      {currentView === "dashboard" && (
        <div className="hidden xl:flex fixed left-10 top-1/2 -translate-y-1/2 z-40 flex-col gap-6 font-mono text-[9px] text-text-mute">
          {[
            { id: "arrival", label: "01", title: "Arrival" },
            { id: "identity", label: "02", title: "Identity" },
            { id: "pipeline", label: "03", title: "Pipeline" },
            { id: "philosophy", label: "04", title: "Philosophy" },
            { id: "projects", label: "05", title: "Showcase" },
            { id: "disciplines", label: "06", title: "Disciplines" },
            { id: "telemetry", label: "07", title: "Telemetry" },
            { id: "assistant-preview", label: "08", title: "Virtual Cole" },
            { id: "contact-form", label: "09", title: "Handshake" },
          ].map((sec) => {
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => {
                  const el = document.getElementById(sec.id);
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "center" });
                  }
                }}
                className="group flex items-center gap-3 text-left focus:outline-none cursor-pointer"
              >
                <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${isActive ? "bg-gold scale-125 ring-2 ring-gold/35" : "bg-border-strong group-hover:bg-text-mute"}`} />
                <span className={`transition-all duration-200 ${isActive ? "text-gold font-bold translate-x-1" : "text-text-mute group-hover:text-foreground"}`}>
                  {sec.label} <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 ml-1.5 text-text-tech">{sec.title}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Primary Content Orchestrator */}
      <main className="relative z-10 max-w-7xl mx-auto w-full px-6 py-12 flex-grow">
        <AnimatePresence mode="wait">
          {currentView === "dashboard" && (
            <div className="space-y-32">
              
              {/* SECTION 1: Arrival (Hero) */}
              <motion.section 
                id="arrival"
                className="min-h-[85vh] flex items-center pt-8"
                {...sectionReveal}
              >
                <Grid columns={12} className="w-full gap-8 items-center">
                  <div className="col-span-12 lg:col-span-7 space-y-8">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-surface border border-border-mute rounded-full shadow-premium-1">
                      <Sparkles className="w-3.5 h-3.5 text-gold" />
                      <span className="font-mono text-[10px] text-text-mute tracking-wider uppercase">Edge Cognitive Systems v1.0</span>
                    </div>

                    <h1 className="text-hero text-foreground">
                      Engineering Core <span className="text-gold">Cognitive Architectures</span> & Distributed Systems.
                    </h1>

                    <p className="text-editorial-body text-text-mute leading-relaxed">
                      Designing secure, edge-native reasoning layers, zero-latency caching pipelines, and technical storytelling frameworks built for enterprise scalability.
                    </p>

                    <div className="flex flex-wrap gap-4 pt-4">
                      <Button
                        variant="primary"
                        size="lg"
                        isMagnetic={true}
                        rightIcon={<ArrowRight className="w-4 h-4" />}
                        onClick={() => handleViewChange("assistant")}
                      >
                        Consult Virtual Cole
                      </Button>
                      <Button
                        ref={magnetTrace.ref as any}
                        variant="secondary"
                        size="lg"
                        style={magnetTrace.style}
                        onClick={() => handleViewChange("timeline")}
                      >
                        Trace Trajectory
                      </Button>
                    </div>
                  </div>
                  
                  {/* Visual Centerpiece: Interactive Knowledge Core */}
                  <div className="col-span-12 lg:col-span-5 flex justify-center items-center">
                    <div className="relative w-full max-w-[360px] lg:max-w-none aspect-square p-2 rounded-large border border-border-strong bg-surface/20 backdrop-blur-md shadow-premium-2 overflow-hidden group">
                      <Canvas3D 
                        mode="three" 
                        className="w-full h-full"
                      />
                      {/* Technical Blueprint Metadata overlays */}
                      <div className="absolute top-4 left-4 font-mono text-[8px] text-text-mute select-none pointer-events-none">
                        SYS.CORE_DYN_RELOAD = TRUE<br/>
                        GL_MATRIX.PERSPECTIVE = 300
                      </div>
                      <div className="absolute bottom-4 right-4 font-mono text-[8px] text-gold select-none pointer-events-none animate-pulse">
                        ● CONNECTED_INTEL_ACTIVE
                      </div>
                    </div>
                  </div>
                </Grid>
              </motion.section>

              {/* SECTION 2: Identity (Who is Cole?) */}
              <motion.section 
                id="identity"
                className="space-y-8 border-t border-border-mute pt-20"
                {...sectionReveal}
              >
                <div className="max-w-xl">
                  <span className="text-technical-caption text-gold uppercase font-mono tracking-widest">[ 01. Core Identity ]</span>
                  <h2 className="text-section-header text-foreground mt-3">Architecting Reason at the Edge</h2>
                </div>
                
                <Grid columns={12}>
                  <div className="col-span-12 md:col-span-6 space-y-4">
                    <p className="text-editorial-body text-text-mute leading-relaxed">
                      ColeAllStar bridges the gap between machine intelligence and web-scale software engineering. I design systems that combine reasoning with edge server execution, eliminating unnecessary latency, vendor lock-in, and infrastructure complexity.
                    </p>
                    <p className="text-editorial-body text-text-mute leading-relaxed">
                      My work centers on building modular platforms, low-overhead RAG engines, and fully grounded AI knowledge assistants that speak with high-fidelity credibility.
                    </p>
                  </div>
                  <div className="col-span-12 md:col-span-6">
                    <GlassPanel className="p-8 h-full flex flex-col justify-center gap-6" intensity="low">
                      <div>
                        <div className="font-mono text-xs text-text-tech uppercase tracking-wider mb-3">Core Technical Infrastructure</div>
                        <div className="flex flex-wrap gap-2">
                          {["Cloudflare Workers", "Workers AI", "Vectorize", "D1 SQLite", "KV Storage", "R2 Object Store", "Next.js 15", "TypeScript", "Framer Motion", "Drizzle ORM"].map((tech) => (
                            <span key={tech} className="px-2.5 py-1.5 bg-surface border border-border-mute text-foreground text-[10px] font-mono rounded-medium">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="border-t border-border-mute pt-4 flex items-center justify-between font-mono text-[9px] text-text-tech">
                        <span>COMPATIBILITY: CLOUDFLARE NATIVE</span>
                        <span className="text-emerald-500">100% EDGE SPEED</span>
                      </div>
                    </GlassPanel>
                  </div>
                </Grid>
              </motion.section>

              {/* SECTION 3: Cognitive Framework (How Cole Thinks) */}
              <motion.section 
                id="pipeline"
                className="space-y-8 border-t border-border-mute pt-20"
                {...sectionReveal}
              >
                <div className="max-w-xl">
                  <span className="text-technical-caption text-gold uppercase font-mono tracking-widest">[ 02. Systems Design ]</span>
                  <h2 className="text-section-header text-foreground mt-3">The Cognitive Pipeline</h2>
                  <p className="text-technical-caption text-text-mute mt-2">
                    An interactive blueprint of how Cole designs low-latency reasoning systems. Hover each node to trace the data vectors.
                  </p>
                </div>

                <Grid columns={12} className="gap-8">
                  {/* Interactive SVG Flowchart */}
                  <div className="col-span-12 md:col-span-8 flex items-center justify-center">
                    <div className="w-full bg-surface border border-border-strong p-8 rounded-large shadow-premium-1 overflow-hidden">
                      <svg className="w-full h-auto text-foreground" viewBox="0 0 500 120" xmlns="http://www.w3.org/2000/svg">
                        {/* Define Paths for Packet Animations */}
                        <g fill="none" strokeWidth="0.75">
                          <path id="path1" d="M 80,60 L 160,60" stroke="currentColor" strokeDasharray="3,3" className={activeNode === "ingest" || activeNode === "cache" ? "text-gold" : "text-border-strong"} />
                          <path id="path2" d="M 220,60 L 300,60" stroke="currentColor" strokeDasharray="3,3" className={activeNode === "cache" || activeNode === "rag" ? "text-gold" : "text-border-strong"} />
                          <path id="path3" d="M 360,60 L 440,60" stroke="currentColor" strokeDasharray="3,3" className={activeNode === "rag" || activeNode === "synthesis" ? "text-gold" : "text-border-strong"} />
                        </g>

                        {/* Flowing Packet Simulators */}
                        <g>
                          <circle r="2" fill="#D4AF37" className="animate-pulse">
                            <animateMotion dur="2.4s" repeatCount="indefinite" path="M 80,60 L 160,60" />
                          </circle>
                          <circle r="2" fill="#0070F3" className="animate-pulse">
                            <animateMotion dur="1.8s" repeatCount="indefinite" path="M 220,60 L 300,60" />
                          </circle>
                          <circle r="2" fill="#D4AF37" className="animate-pulse">
                            <animateMotion dur="1.4s" repeatCount="indefinite" path="M 360,60 L 440,60" />
                          </circle>
                        </g>

                        {/* Interactive Nodes */}
                        <g stroke="currentColor" strokeWidth="1" fill="none">
                          <circle cx="50" cy="60" r="26" 
                            className={`cursor-pointer transition-all duration-300 ${activeNode === "ingest" ? "fill-gold/10 stroke-gold ring-4 ring-gold/20" : "fill-background stroke-border-strong"}`}
                            onMouseEnter={() => setActiveNode("ingest")}
                          />
                          <circle cx="190" cy="60" r="26"
                            className={`cursor-pointer transition-all duration-300 ${activeNode === "cache" ? "fill-gold/10 stroke-gold" : "fill-background stroke-border-strong"}`}
                            onMouseEnter={() => setActiveNode("cache")}
                          />
                          <circle cx="330" cy="60" r="26"
                            className={`cursor-pointer transition-all duration-300 ${activeNode === "rag" ? "fill-gold/10 stroke-gold" : "fill-background stroke-border-strong"}`}
                            onMouseEnter={() => setActiveNode("rag")}
                          />
                          <circle cx="450" cy="60" r="16"
                            className={`cursor-pointer transition-all duration-300 ${activeNode === "synthesis" ? "fill-gold/10 stroke-gold" : "fill-background stroke-border-strong"}`}
                            onMouseEnter={() => setActiveNode("synthesis")}
                          />
                        </g>

                        {/* Node Labels */}
                        <g fill="currentColor" fontFamily="monospace" fontSize="7.5" textAnchor="middle" className="pointer-events-none select-none text-[7.5px] font-bold dark:text-white">
                          <text x="50" y="63">Ingest</text>
                          <text x="190" y="63">Cache</text>
                          <text x="330" y="63">RAG</text>
                          <text x="450" y="63">LLM</text>
                        </g>
                      </svg>
                    </div>
                  </div>

                  {/* Telemetry Details Panel */}
                  <div className="col-span-12 md:col-span-4">
                    <AnimatePresence mode="wait">
                      {activeNode && (
                        <motion.div
                          key={activeNode}
                          initial={{ opacity: 0, x: 15 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -15 }}
                          transition={{ duration: 0.2 }}
                          className="h-full"
                        >
                          <GlassPanel className="p-6 h-full border-gold/30 flex flex-col justify-between" intensity="medium">
                            <div>
                              <div className="font-mono text-[9px] text-gold uppercase tracking-widest">Pipeline Telemetry</div>
                              <h4 className="text-subheading-technical text-foreground mt-2">{cognitiveNodes[activeNode].title}</h4>
                              <p className="text-xs text-text-mute mt-3.5 leading-relaxed">{cognitiveNodes[activeNode].desc}</p>
                            </div>
                            <div className="border-t border-border-mute pt-3.5 mt-5 flex items-center gap-1.5 font-mono text-[9px] text-text-tech">
                              <Activity className="w-3.5 h-3.5 text-gold" />
                              <span>{cognitiveNodes[activeNode].metrics}</span>
                            </div>
                          </GlassPanel>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Grid>
              </motion.section>

              {/* SECTION 4: Engineering Philosophy */}
              <motion.section 
                id="philosophy"
                className="space-y-8 border-t border-border-mute pt-20"
                {...sectionReveal}
              >
                <div className="max-w-xl">
                  <span className="text-technical-caption text-gold uppercase font-mono tracking-widest">[ 03. Philosophy ]</span>
                  <h2 className="text-section-header text-foreground mt-3">Architectural Pillars</h2>
                </div>

                <Grid columns={12}>
                  {[
                    {
                      num: "01",
                      title: "Interfaces Over Implementations",
                      desc: "Define strict boundaries. Switching database drivers, vector indexes, or AI models is simple because the business logic is decoupled.",
                    },
                    {
                      num: "02",
                      title: "Decoupled Edge Gateways",
                      desc: "The frontend never interacts directly with AI models. Coordinated serverless workers serve as secure, low-latency API proxies.",
                    },
                    {
                      num: "03",
                      title: "Strict Knowledge Grounding",
                      desc: "Hallucinations are rejected at the gate. AI assistants only answer using verified, semantic knowledge sourced from documentation.",
                    },
                  ].map((p, idx) => (
                    <div key={idx} className="col-span-12 md:col-span-4 space-y-3 p-4 border border-transparent hover:border-border-mute rounded-medium transition-colors duration-250">
                      <div className="font-mono text-xs text-gold font-bold">{p.num}.</div>
                      <h3 className="text-subheading-technical text-foreground">{p.title}</h3>
                      <p className="text-xs text-text-mute leading-relaxed">{p.desc}</p>
                    </div>
                  ))}
                </Grid>
              </motion.section>

              {/* SECTION 5: Selected Projects (Bento Spotlight Showcase) */}
              <motion.section 
                id="projects"
                className="space-y-8 border-t border-border-mute pt-20"
                {...sectionReveal}
              >
                <div className="flex items-end justify-between pb-4">
                  <div>
                    <span className="text-technical-caption text-gold uppercase font-mono tracking-widest">[ 04. Showcase ]</span>
                    <h2 className="text-section-header text-foreground mt-3">System Blueprints</h2>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 font-mono text-[10px] text-gold">
                    <Activity className="w-3.5 h-3.5 animate-pulse" />
                    <span>BENTO_GRID_V3.0</span>
                  </div>
                </div>

                <Grid columns={12}>
                  {projectSummaries.map((project) => (
                    <div key={project.id} className="col-span-12 md:col-span-4">
                      <Card
                        glowEffect={true}
                        interactive={true}
                        onClick={() => handleProjectSelect(project.slug)}
                        className="p-6 min-h-[280px] flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 bg-surface-alt border border-border-mute text-[9px] font-mono text-foreground font-bold rounded uppercase">
                              {project.category}
                            </span>
                            <span className="text-text-tech text-[10px] font-mono">{project.latencyMetric}</span>
                          </div>
                          <h3 className="text-heading-technical text-foreground mt-4">{project.title}</h3>
                          <p className="text-xs text-text-mute mt-3.5 leading-relaxed line-clamp-4">{project.description}</p>
                        </div>

                        <div className="border-t border-border-mute pt-3.5 mt-4 flex items-center justify-between text-[9px] font-mono text-text-tech">
                          <span>IMPACT: {project.scaleMetric}</span>
                          <span className="text-gold group-hover:underline cursor-pointer">Analyze Blueprint →</span>
                        </div>
                      </Card>
                    </div>
                  ))}
                </Grid>
              </motion.section>

              {/* SECTION 6: Domain Pillars (Disciplines) */}
              <motion.section 
                id="disciplines"
                className="space-y-8 border-t border-border-mute pt-20"
                {...sectionReveal}
              >
                <div className="max-w-xl">
                  <span className="text-technical-caption text-gold uppercase font-mono tracking-widest">[ 05. Capabilities ]</span>
                  <h2 className="text-section-header text-foreground mt-3">Specialized Disciplines</h2>
                </div>

                <Grid columns={12} className="gap-8">
                  {/* Pillar 1: AI Engineering */}
                  <div className="col-span-12 md:col-span-4 space-y-4 flex flex-col justify-between h-full">
                    <div className="space-y-4">
                      <div className="p-2 w-10 h-10 bg-gold/10 text-gold rounded-medium border border-gold/20 flex items-center justify-center">
                        <Cpu className="w-5 h-5" />
                      </div>
                      <h3 className="text-heading-technical text-foreground">AI Systems Engineering</h3>
                      <p className="text-xs text-text-mute leading-relaxed">
                        Building low-latency RAG indexes, embedding workflows, and grounded agent networks. Enforcing cosine similarity guardrails to block model hallucinations.
                      </p>
                    </div>
                    <div className="space-y-3 pt-3">
                      <Terminal title="rag_query.ts" lines={aiTerminalLines} />
                      <button 
                        onClick={runAiTerminal}
                        disabled={aiRunning}
                        className="w-full py-2 bg-surface hover:bg-surface-alt border border-border-strong rounded font-mono text-[9px] text-foreground transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {aiRunning ? (
                          <>
                            <RotateCw className="w-3 h-3 animate-spin text-gold" />
                            <span>EXECUTING_MODEL_PIPELINE...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 text-gold" />
                            <span>SIMULATE_RAG_QUERY</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Pillar 2: Software Architecture */}
                  <div className="col-span-12 md:col-span-4 space-y-4 flex flex-col justify-between h-full">
                    <div className="space-y-4">
                      <div className="p-2 w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-medium border border-emerald-500/20 flex items-center justify-center">
                        <Network className="w-5 h-5" />
                      </div>
                      <h3 className="text-heading-technical text-foreground">Edge Architecture</h3>
                      <p className="text-xs text-text-mute leading-relaxed">
                        Deploying high-performance serverless gateways, memory caches, and resilient API clients using Cloudflare Pages, Workers D1, and KV namespaces.
                      </p>
                    </div>
                    <div className="space-y-3 pt-3">
                      <Terminal title="edge_route.ts" lines={edgeTerminalLines} />
                      <button 
                        onClick={runEdgeTerminal}
                        disabled={edgeRunning}
                        className="w-full py-2 bg-surface hover:bg-surface-alt border border-border-strong rounded font-mono text-[9px] text-foreground transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {edgeRunning ? (
                          <>
                            <RotateCw className="w-3 h-3 animate-spin text-emerald-500" />
                            <span>CONNECTING_TO_EDGE_CLUSTER...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 text-emerald-500" />
                            <span>SIMULATE_EDGE_DEPLOY</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Pillar 3: Technical Writing */}
                  <div className="col-span-12 md:col-span-4 space-y-4 flex flex-col justify-between h-full">
                    <div className="space-y-4">
                      <div className="p-2 w-10 h-10 bg-purple-500/10 text-purple-600 rounded-medium border border-purple-500/20 flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <h3 className="text-heading-technical text-foreground">Technical Scribing</h3>
                      <p className="text-xs text-text-mute leading-relaxed">
                        Authoring clean, exhaustive systems specifications, Product Requirements (PRD), and Architecture Decision Records (ADR) that represent clear, structured thinking.
                      </p>
                    </div>
                    <div className="space-y-3 pt-3">
                      <Terminal title="adr_014.md" lines={scribingTerminalLines} />
                      <button 
                        onClick={runScribingTerminal}
                        disabled={scribingRunning}
                        className="w-full py-2 bg-surface hover:bg-surface-alt border border-border-strong rounded font-mono text-[9px] text-foreground transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {scribingRunning ? (
                          <>
                            <RotateCw className="w-3 h-3 animate-spin text-purple-600" />
                            <span>INDEXING_BLUEPRINTS...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 text-purple-600" />
                            <span>SIMULATE_ADR_BUILD</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </Grid>
              </motion.section>

              {/* SECTION 7: Observability HUD Panel */}
              <motion.section 
                id="telemetry"
                className="space-y-8 border-t border-border-mute pt-20"
                {...sectionReveal}
              >
                <div className="max-w-xl">
                  <span className="text-technical-caption text-gold uppercase font-mono tracking-widest">[ 06. Observability ]</span>
                  <h2 className="text-section-header text-foreground mt-3">Production Telemetry HUD</h2>
                  <p className="text-technical-caption text-text-mute mt-2">
                    Live system health monitor detailing edge latency, query cost, and cache optimization performance.
                  </p>
                </div>

                <Grid columns={12} className="gap-6">
                  {/* Metric Card 1: Edge Latency Sparkline */}
                  <div className="col-span-12 md:col-span-6">
                    <Card className="p-6 h-full flex flex-col justify-between" glowEffect={true}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-gold" />
                          <span className="font-mono text-[10px] text-text-mute uppercase font-semibold">Real-time Edge RTT Latency</span>
                        </div>
                        <span className="font-mono text-xs text-foreground font-bold">{latency}</span>
                      </div>
                      
                      {/* Interactive SVG Sparkline Graph */}
                      <div className="my-6 h-20 w-full flex items-end">
                        <svg className="w-full h-full overflow-visible text-gold" viewBox="0 0 100 100" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="rgba(212, 175, 55, 0.25)" />
                              <stop offset="100%" stopColor="rgba(212, 175, 55, 0)" />
                            </linearGradient>
                          </defs>
                          
                          {/* Area fill */}
                          <polygon
                            fill="url(#sparklineGrad)"
                            points={`0,100 ${latencyHistory
                              .map((val, i) => `${(i / (latencyHistory.length - 1)) * 100},${100 - ((val - 10) / 60) * 80}`)
                              .join(" ")} 100,100`}
                          />
                          
                          {/* Graph line */}
                          <polyline
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            points={latencyHistory
                              .map((val, i) => `${(i / (latencyHistory.length - 1)) * 100},${100 - ((val - 10) / 60) * 80}`)
                              .join(" ")}
                          />
                        </svg>
                      </div>

                      <div className="flex justify-between items-center border-t border-border-mute pt-3 font-mono text-[8.5px] text-text-tech">
                        <span>MIN_RTT: 12ms</span>
                        <span>MAX_RTT: 68ms</span>
                        <span>INTERVAL: 2.5s</span>
                      </div>
                    </Card>
                  </div>

                  {/* Metric Card 2: Edge Database and Cache Status */}
                  <div className="col-span-12 md:col-span-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 h-full gap-6">
                      <Card className="p-5 flex flex-col justify-between" glowEffect={false}>
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5">
                            <Database className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="font-mono text-[9px] text-text-mute uppercase font-semibold">D1 SQLite Stats</span>
                          </div>
                          <h4 className="text-2xl font-bold tracking-tight mt-1 text-foreground">0.14ms</h4>
                          <p className="text-[10px] text-text-mute leading-relaxed">Average SQLite query compilation cost inside Cloudflare D1 local runtime.</p>
                        </div>
                        <div className="border-t border-border-mute pt-2.5 font-mono text-[8px] text-emerald-500 uppercase font-bold">
                          STATUS: 100% HEALTHY
                        </div>
                      </Card>

                      <Card className="p-5 flex flex-col justify-between" glowEffect={false}>
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5">
                            <Server className="w-3.5 h-3.5 text-purple-500" />
                            <span className="font-mono text-[9px] text-text-mute uppercase font-semibold">KV Semantic Cache</span>
                          </div>
                          <h4 className="text-2xl font-bold tracking-tight mt-1 text-foreground">94.2%</h4>
                          <p className="text-[10px] text-text-mute leading-relaxed">Global cache hits. Similar semantic prompt hashes bypass LLM inference entirely.</p>
                        </div>
                        <div className="border-t border-border-mute pt-2.5 font-mono text-[8px] text-purple-500 uppercase font-bold">
                          OPTIMIZATION: ULTRA_HIGH
                        </div>
                      </Card>
                    </div>
                  </div>
                </Grid>
              </motion.section>

              {/* SECTION 8: Grounded Handshake (Virtual Cole Preview) */}
              <motion.section 
                id="assistant-preview"
                className="space-y-8 border-t border-border-mute pt-20"
                {...sectionReveal}
              >
                <Grid columns={12} className="gap-8">
                  <div className="col-span-12 md:col-span-5 flex flex-col justify-center space-y-5">
                    <span className="text-technical-caption text-gold uppercase font-mono tracking-widest">[ 07. Grounded AI ]</span>
                    <h2 className="text-section-header text-foreground">Interrogate the Knowledge Base</h2>
                    <p className="text-xs text-text-mute leading-relaxed">
                      Virtual Cole is a high-performance edge-native assistant grounded *only* in Cole AllStar's verified projects, blog essays, and career timeline.
                    </p>
                    <p className="text-xs text-text-mute leading-relaxed">
                      Unlike general chatbots, he will never speculate or hallucinate. If the context is missing, he will politely state his limitations.
                    </p>
                    
                    {/* Suggested preset questions */}
                    <div className="space-y-2 pt-2">
                      <div className="text-[9px] font-mono text-text-tech uppercase font-bold tracking-wider">Select Grounded Query:</div>
                      <div className="flex flex-col gap-2">
                        {presetQuestions.map((pq, idx) => (
                          <button
                            key={idx}
                            onClick={() => triggerChatSimulation(pq.q, pq.a)}
                            disabled={chatStep === "thinking" || chatStep === "streaming"}
                            className={`px-3 py-2 text-left text-xs rounded border transition-all duration-200 cursor-pointer ${
                              selectedPreset === pq.q 
                                ? "bg-gold/10 border-gold text-foreground font-medium" 
                                : "bg-surface border-border-strong hover:border-text-mute text-text-mute hover:text-foreground"
                            }`}
                          >
                            {pq.q}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <Button
                        variant="secondary"
                        size="md"
                        rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                        onClick={() => handleViewChange("assistant")}
                      >
                        Launch Full Interactive AI Assistant
                      </Button>
                    </div>
                  </div>

                  {/* Simulated Grounded RAG Chat Interface */}
                  <div className="col-span-12 md:col-span-7">
                    <GlassPanel className="p-8 border-gold/25 flex flex-col justify-between min-h-[380px]" intensity="high">
                      <div className="flex items-center justify-between border-b border-border-mute pb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-xs font-mono font-bold tracking-wide uppercase">Virtual Cole v1.2</span>
                        </div>
                        <span className="text-[10px] font-mono text-text-tech uppercase font-semibold">Grounded context only</span>
                      </div>
                      
                      <div className="my-6 space-y-4 text-xs flex-grow flex flex-col justify-center">
                        {chatStep === "idle" && (
                          <div className="text-center space-y-2 p-6 border border-dashed border-border-mute rounded-medium">
                            <HelpCircleIcon className="w-6 h-6 text-gold/65 mx-auto animate-bounce" />
                            <p className="font-mono text-[9px] text-text-tech uppercase">Select a telemetry query on the left to interrogate Virtual Cole.</p>
                          </div>
                        )}

                        {chatStep !== "idle" && (
                          <>
                            {/* Visitor Question block */}
                            <div className="flex gap-2.5 bg-surface p-3.5 rounded-medium border border-border-mute max-w-[85%] self-start">
                              <span className="font-bold text-foreground select-none">Visitor:</span>
                              <span className="text-text-mute">{selectedPreset}</span>
                            </div>

                            {/* Thinking state */}
                            {chatStep === "thinking" && (
                              <div className="flex gap-2.5 bg-gold/5 p-3.5 rounded-medium border border-gold/10 max-w-[90%] ml-auto items-center">
                                <RotateCw className="w-3.5 h-3.5 animate-spin text-gold" />
                                <span className="font-mono text-[8.5px] text-text-tech uppercase tracking-wide animate-pulse">
                                  Querying Vectorize Index & D1 database...
                                </span>
                              </div>
                            )}

                            {/* Streaming/Answer block */}
                            {(chatStep === "streaming" || chatStep === "done") && (
                              <div className="flex flex-col gap-2 bg-gold/5 p-4 rounded-medium border border-gold/15 max-w-[90%] ml-auto">
                                <div className="flex gap-2.5">
                                  <span className="text-gold font-bold select-none">Virtual Cole:</span>
                                  <span className="text-text-mute leading-relaxed font-sans">{displayedAnswer}</span>
                                </div>
                                {chatStep === "streaming" && (
                                  <span className="w-1.5 h-3 bg-gold inline-block animate-pulse ml-1" />
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      <div className="border-t border-border-mute pt-3.5 text-[9px] font-mono text-text-tech flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-gold" />
                        <span>RAG VERIFICATION: Cosine similarity threshold set to &ge; 0.62. Hallucinations bypassed.</span>
                      </div>
                    </GlassPanel>
                  </div>
                </Grid>
              </motion.section>

              {/* SECTION 9: Connection (System Handshake) */}
              <motion.section 
                id="contact-form"
                className="space-y-8 border-t border-border-mute pt-20"
                {...sectionReveal}
              >
                <div className="max-w-xl">
                  <span className="text-technical-caption text-gold uppercase font-mono tracking-widest">[ 08. Correspondence ]</span>
                  <h2 className="text-section-header text-foreground mt-3">Initiate System Handshake</h2>
                  <p className="text-technical-caption text-text-mute mt-2">
                    Send a secure transactional dispatch request or schedule a direct edge sync appointment.
                  </p>
                </div>

                <div className="max-w-xl mx-auto bg-surface border border-border-strong rounded-xlarge p-8 shadow-premium-2 space-y-6">
                  <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor="form-sender-name-dash" className="text-[10px] font-mono text-text-mute font-semibold uppercase tracking-wider">Sender Name</label>
                        <input 
                          id="form-sender-name-dash"
                          type="text" 
                          placeholder="John Doe" 
                          className="w-full bg-background border border-border-strong focus:border-gold focus:outline-none rounded-medium px-4 py-3.5 text-xs font-sans transition-colors duration-200 text-foreground"
                          required 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="form-sender-email-dash" className="text-[10px] font-mono text-text-mute font-semibold uppercase tracking-wider">Email Address</label>
                        <input 
                          id="form-sender-email-dash"
                          type="email" 
                          placeholder="john@organization.com" 
                          className="w-full bg-background border border-border-strong focus:border-gold focus:outline-none rounded-medium px-4 py-3.5 text-xs font-sans transition-colors duration-200 text-foreground"
                          required 
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="form-payload-dash" className="text-[10px] font-mono text-text-mute font-semibold uppercase tracking-wider">Transmission Payload</label>
                      <textarea 
                        id="form-payload-dash"
                        placeholder="Discussing edge databases, low-latency API architecture, and RAG index setups..." 
                        className="w-full min-h-[110px] bg-background border border-border-strong focus:border-gold focus:outline-none rounded-medium px-4 py-3.5 text-xs font-sans transition-colors duration-200 resize-none text-foreground"
                        required
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="w-full py-3.5 bg-[#111111] hover:bg-black text-[#FAF9F6] text-xs font-mono font-medium rounded-medium transition-colors shadow-premium-1 flex items-center justify-center gap-2 cursor-pointer dark:bg-white dark:hover:bg-[#ECECEC] dark:text-[#000000]"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>DISPATCH_MESSAGE_PAYLOAD</span>
                    </button>
                  </form>
                </div>
              </motion.section>
            </div>
          )}

          {currentView === "notebook" && (
            <motion.div
              key="notebook"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              <IntellectNotebook />
            </motion.div>
          )}

          {currentView === "timeline" && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              <ChronoTrajectory 
                onProjectSelect={handleProjectSelect}
              />
            </motion.div>
          )}

          {currentView === "assistant" && (
            <motion.div
              key="assistant"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-2xl mx-auto space-y-8 animate-fade-in"
            >
              <div>
                <span className="px-2.5 py-1 bg-gold/10 text-gold font-mono text-[9px] rounded font-semibold uppercase tracking-wider">Cognitive Mind</span>
                <h2 className="font-sans font-medium text-3xl mt-3 tracking-tight">Virtual Cole Assistant</h2>
                <p className="text-text-mute mt-2 text-sm leading-relaxed">
                  Interrogate Virtual Cole about system designs, relational D1 database schemas, trajectories, and strategic engineering decisions.
                </p>
              </div>

              <VirtualColeAssistant 
                onProjectSelect={handleProjectSelect}
              />
            </motion.div>
          )}

          {currentView === "contact" && (
            <motion.div
              key="contact"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-xl mx-auto space-y-8"
            >
              <div>
                <span className="px-2.5 py-1 bg-purple-500/10 text-purple-600 font-mono text-[9px] rounded font-semibold uppercase tracking-wider">Direct Ink</span>
                <h2 className="font-sans font-medium text-3xl mt-3 tracking-tight">Initiate System Handshake</h2>
                <p className="text-text-mute mt-2 text-sm leading-relaxed">
                  Send a transactional message or schedule a direct calendar appointment with Cole.
                </p>
              </div>

              <div className="bg-surface border border-border-strong rounded-xlarge p-8 shadow-premium-2 space-y-6">
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="form-sender-name" className="text-[10px] font-mono text-text-mute font-semibold uppercase">Sender Name</label>
                      <input 
                        id="form-sender-name"
                        type="text" 
                        placeholder="John Doe" 
                        className="w-full bg-background border border-border-strong focus:border-gold focus:outline-none rounded-medium px-4 py-3 text-xs font-sans transition-colors duration-200 text-foreground"
                        required 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="form-sender-email" className="text-[10px] font-mono text-text-mute font-semibold uppercase">Email Address</label>
                      <input 
                        id="form-sender-email"
                        type="email" 
                        placeholder="john@organization.com" 
                        className="w-full bg-background border border-border-strong focus:border-gold focus:outline-none rounded-medium px-4 py-3 text-xs font-sans transition-colors duration-200 text-foreground"
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="form-payload" className="text-[10px] font-mono text-text-mute font-semibold uppercase">Transmission Payload</label>
                    <textarea 
                      id="form-payload"
                      placeholder="Discussing low-latency edge synchronizers..." 
                      className="w-full min-h-[100px] bg-background border border-border-strong focus:border-gold focus:outline-none rounded-medium px-4 py-3 text-xs font-sans transition-colors duration-200 resize-none text-foreground"
                      required
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="w-full py-3 bg-[#111111] hover:bg-black text-[#FAF9F6] text-xs font-mono font-medium rounded-medium transition-colors shadow-premium-1 flex items-center justify-center gap-2 cursor-pointer dark:bg-white dark:hover:bg-[#ECECEC] dark:text-[#000000]"
                  >
                    DISPATCH_MESSAGE
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Global Navigation Dock */}
      <NavigationDock currentView={currentView} onViewChange={handleViewChange} />

      {/* Dynamic Glass Box Split Case Study Overlay */}
      <AnimatePresence>
        {selectedProjectSlug && (
          <CaseStudyOverlay 
            projectSlug={selectedProjectSlug}
            onClose={handleCloseProject}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Simple local HelpCircle Icon to keep it zero-dependency
function HelpCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  );
}

export default function RootPage() {
  return (
    <Suspense fallback={<Loader />}>
      <PageContent />
    </Suspense>
  );
}
