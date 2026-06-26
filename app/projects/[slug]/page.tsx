"use client";

import React, { useState, useEffect, useRef, use } from "react";
import { 
  ArrowLeft, 
  Activity, 
  Clock, 
  BookOpen, 
  ChevronRight, 
  Cpu, 
  Network, 
  Shield, 
  Award, 
  HelpCircle,
  RotateCw,
  ShieldAlert,
  Github,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

// Import platform and design primitives using relative paths
import { cmsClient, type Project } from "../../../src/shared/lib/cms/cms-client";
import { Card } from "../../../src/shared/components/ui/card";
import { GlassPanel } from "../../../src/shared/components/ui/glass-panel";
import { Grid } from "../../../src/shared/components/ui/grid";
import { Terminal } from "../../../src/shared/components/ui/terminal";
import SVGArchitectureViewer from "@/features/projects/svg-architecture-viewer";
import ComparisonSlider from "@/features/projects/comparison-slider";
import type { ProjectSlug } from "@/features/projects/domain/project-catalog";

const iconMap = {
  cpu: Cpu,
  network: Network,
  shield: Shield,
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Utility to convert text into URL-friendly IDs for TOC anchor linking
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .trim();
}

export default function ProjectDetailPage({ params }: PageProps) {
  const { slug } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  // Scroll and TOC States
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeHeading, setActiveHeading] = useState("executive-summary-the-architectural-challenge");
  const containerRef = useRef<HTMLDivElement>(null);

  // Local RAG chat simulator states
  const [chatStep, setChatStep] = useState<"idle" | "thinking" | "streaming" | "done">("idle");
  const [displayedAnswer, setDisplayedAnswer] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);

  // Load project details from the CMS Provider
  useEffect(() => {
    cmsClient.getProjectBySlug(slug).then((res: Project | null) => {
      if (res) {
        setProject(res);
      } else {
        notFound();
      }
      setLoading(false);
    });
  }, [slug]);

  // Handle Reading Progress bar on scroll
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    if (scrollHeight - clientHeight === 0) {
      setScrollProgress(0);
    } else {
      setScrollProgress((scrollTop / (scrollHeight - clientHeight)) * 100);
    }
  };

  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.addEventListener("scroll", handleScroll);
      handleScroll();
    }
    return () => el?.removeEventListener("scroll", handleScroll);
  }, [project]);

  // Scroll Spy to track active headings
  useEffect(() => {
    if (!project) return;
    
    // Find all rendered headings in our parsed markdown container
    const headingElements = Array.from(document.querySelectorAll("h2, h3"))
      .map((el) => el.id)
      .filter(Boolean);

    const observers = headingElements.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveHeading(id);
          }
        },
        { rootMargin: "-20% 0px -60% 0px" } // Highlights as heading passes upper-middle screen
      );
      observer.observe(el);
      return { observer, el };
    });

    return () => {
      observers.forEach((obs) => {
        if (obs) obs.observer.unobserve(obs.el);
      });
    };
  }, [project]);

  // RAG Chat Simulation trigger
  const handlePresetQuestion = (question: string) => {
    if (chatStep === "thinking" || chatStep === "streaming") return;
    setSelectedQuestion(question);
    setChatStep("thinking");
    setDisplayedAnswer("");

    // Look up simulation answer matching key project questions
    let answerText = "Information retrieved from secure edge context.";
    if (question.includes("latency") || question.includes("average")) {
      answerText = `The system achieves an average p95 RTT latency of ${project?.latencyMetric}. This is guaranteed by combining local Cloudflare KV semantic caches (which respond in under 12ms) with lightweight Gemini Flash pre-routers. [Sources: Architecture Specs, ADR-009]`;
    } else if (question.includes("resolve") || question.includes("contention") || question.includes("KV")) {
      answerText = "The system intercepts concurrent writes by consolidating database queries in local KV-buffered serverless queues. The sync worker then bundles updates and commits them in single-batch SQLite transactions. [Sources: Write Queues Spec, ADR-012]";
    } else if (question.includes("select") || question.includes("Flash") || question.includes("Rust") || question.includes("firewall")) {
      answerText = "We compiled a custom payload validator written in Rust into WebAssembly. This eliminates V8 thread blocking by running parallel Aho-Corasick string matching algorithms in under 1.2ms with zero cold start overhead. [Sources: WASM Security Boundaries, ADR-014]";
    }

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
      }, 12);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#FAF9F6] text-black dark:bg-[#0B0B0B] dark:text-white">
        <div className="flex flex-col items-center gap-3">
          <Activity className="h-6 w-6 animate-pulse text-[#D4AF37]" />
          <span className="font-mono text-xs text-text-mute tracking-wider">LOADING_SYSTEM_BLUEPRINTS...</span>
        </div>
      </div>
    );
  }

  if (!project) {
    return notFound();
  }

  const ProjectIcon = iconMap[project.iconKey as keyof typeof iconMap] || Cpu;

  // Custom Edge-Native Markdown Parser to avoid external dynamic fs dependencies
  const parseMarkdownContent = (markdownText: string) => {
    // Split block content by headers, code blocks, alerts, tables
    const blocks = markdownText.split(/\n(?=(?:##?#? |```|> \[!|\|))/);
    
    return blocks.map((block, idx) => {
      const trimmed = block.trim();
      if (!trimmed) return null;

      // H2 Headings
      if (trimmed.startsWith("## ")) {
        const text = trimmed.replace("## ", "").trim();
        return (
          <h2 
            key={idx} 
            id={slugify(text)} 
            className="font-sans font-medium text-xs text-gold mt-10 mb-4 border-b border-border-strong pb-2.5 tracking-widest uppercase font-mono"
          >
            {text}
          </h2>
        );
      }

      // H3 Headings
      if (trimmed.startsWith("### ")) {
        const text = trimmed.replace("### ", "").trim();
        return (
          <h3 
            key={idx} 
            id={slugify(text)} 
            className="font-sans font-medium text-xs text-foreground mt-8 mb-3 tracking-tight font-semibold"
          >
            {text}
          </h3>
        );
      }

      // H1 (Page Title fallback if any)
      if (trimmed.startsWith("# ")) {
        const text = trimmed.replace("# ", "").trim();
        return (
          <h1 
            key={idx} 
            id={slugify(text)} 
            className="font-sans font-medium text-2xl text-foreground mt-12 mb-6 border-b border-border-strong pb-3 tracking-tight"
          >
            {text}
          </h1>
        );
      }

      // Code blocks (Fenced in ```)
      if (trimmed.startsWith("```")) {
        const lines = trimmed.split("\n");
        const firstLine = lines[0].replace("```", "").trim();
        const langAndTitle = firstLine.split(":");
        const title = langAndTitle[1] || langAndTitle[0] || "source.code";
        const codeLines = lines.slice(1, -1);
        
        return (
          <div key={idx} className="my-6">
            <Terminal title={title} lines={codeLines} showControls={true} />
          </div>
        );
      }

      // Alerts (> [!NOTE] or warning)
      if (trimmed.startsWith("> [!")) {
        const lines = trimmed.split("\n");
        const alertHeader = lines[0];
        const alertType = alertHeader.match(/\[!(.*)\]/)?.[1] || "IMPORTANT";
        const text = lines.slice(1).map(l => l.replace(/^>\s?/, "")).join("\n");
        
        return (
          <div key={idx} className="my-6 p-5 bg-gold/5 border border-gold/15 rounded-medium flex gap-4">
            <ShieldAlert className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed text-text-mute space-y-1 font-sans">
              <strong className="text-foreground uppercase font-mono text-[9px] tracking-wider block">{alertType}</strong>
              <p>{text}</p>
            </div>
          </div>
        );
      }

      // Tables (| Col 1 | Col 2 |)
      if (trimmed.startsWith("|")) {
        const lines = trimmed.split("\n");
        const rows = lines.map(line => line.split("|").map(cell => cell.trim()).filter(Boolean));
        if (rows.length < 2) return null;
        
        const headers = rows[0];
        const dataRows = rows.slice(2); // Skips separating row |---|---|
        
        return (
          <div key={idx} className="my-6 overflow-x-auto border border-border-strong rounded-large shadow-sm">
            <table className="w-full text-xs font-mono text-left border-collapse bg-surface/30">
              <thead>
                <tr className="border-b border-border-strong text-text-mute bg-surface-alt/50">
                  {headers.map((h, i) => (
                    <th key={i} className="p-3 font-semibold uppercase text-[9px] tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataRows.map((row, rIdx) => (
                  <tr key={rIdx} className="border-b border-border-mute/50 last:border-0 hover:bg-surface-alt/20 transition-colors">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-3 text-text-mute">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      // Bullet Lists (- Item or * Item)
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        // Capture items splitting by line list starters
        const items = trimmed.split(/\n[*\-]\s+/).map(item => item.replace(/^[*\-]\s+/, "").trim());
        return (
          <ul key={idx} className="list-disc pl-5 my-4 space-y-2 text-xs text-text-mute leading-relaxed font-sans">
            {items.map((item, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            ))}
          </ul>
        );
      }

      // Standard text paragraphs
      return (
        <p 
          key={idx} 
          className="text-xs text-text-mute leading-relaxed my-4 font-sans whitespace-pre-line"
          dangerouslySetInnerHTML={{
            __html: trimmed
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold formatting support
              .replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 bg-surface border border-border-mute font-mono text-[10px] rounded text-foreground">$1</code>') // Code formatting support
          }}
        />
      );
    });
  };

  // Dynamically compile structural Table of Contents headings from the Markdown text
  const getTableOfContents = () => {
    const lines = project.content.split("\n");
    return lines
      .filter((line: string) => line.startsWith("## "))
      .map((line: string) => {
        const title = line.replace("## ", "").trim();
        return {
          title,
          id: slugify(title)
        };
      });
  };

  const tocHeadings = getTableOfContents();

  // Construct structured JSON-LD data for Google/SEO crawlers
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": project.title,
    "alternativeHeadline": project.subtitle,
    "description": project.description,
    "author": {
      "@type": "Person",
      "name": "ColeAllStar",
      "jobTitle": "AI Systems Engineer & Software Architect",
      "url": "https://coleallstar.dev"
    },
    "dateCompleted": project.completionDate,
    "softwareVersion": project.version,
    "about": {
      "@type": "Thing",
      "name": project.category
    },
    "dependencies": project.tags.join(", "),
    "url": `https://coleallstar.dev/projects/${project.slug}`
  };

  return (
    <div className="relative min-h-screen text-[#111111] dark:text-[#FFFFFF] flex flex-col justify-between overflow-x-hidden pb-32">
      
      {/* Inject JSON-LD Structured Data for Crawlers */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Top Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-[2px] bg-black/[0.04] dark:bg-white/[0.04] z-50">
        <div 
          className="h-full bg-gold transition-all duration-100 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Header telemetry and brand */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-5 flex items-center justify-between border-b border-border-mute bg-background/20 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <Link href="/" className="font-sans font-medium text-sm tracking-wider hover:text-gold transition-colors">
            C O L E . D E V
          </Link>
          <span className="text-gray-300 dark:text-neutral-700 font-sans text-xs">/</span>
          <Link href="/projects" className="font-sans text-xs text-text-mute hover:text-foreground transition-colors uppercase font-semibold">
            Projects
          </Link>
        </div>

        {/* Dynamic scroll indicator */}
        <div className="flex items-center gap-4 text-xs font-mono text-text-mute">
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            <span>JOURNAL_READER: ONLINE</span>
          </div>
          <span className="border-l border-border-mute pl-4 font-semibold text-foreground">
            {Math.round(scrollProgress)}% READ
          </span>
        </div>
      </header>

      {/* Main Dual-Panel Split-Screen Workspace */}
      <main className="relative z-10 max-w-7xl w-full mx-auto p-6 flex flex-col lg:flex-row gap-8 items-start flex-grow overflow-visible">
        
        {/* LEFT COLUMN: Sticky System Topology Diagram & Project Metadata Panel (Sticky) */}
        <div className="w-full lg:w-[48%] lg:sticky lg:top-24 space-y-6 flex-shrink-0">
          
          {/* Interactive Topology Viewport */}
          <div className="w-full h-[380px] rounded-xlarge overflow-hidden border border-border-strong shadow-premium-2 bg-surface/25 backdrop-blur-md">
            <SVGArchitectureViewer projectSlug={project.slug as ProjectSlug} />
          </div>

          {/* Structured Project Metadata Grid */}
          <GlassPanel className="p-6 border-border-strong shadow-premium-1" intensity="low">
            <div className="flex items-center gap-2 border-b border-border-mute pb-3 mb-4">
              <Award className="w-4 h-4 text-gold" />
              <span className="font-mono text-[9px] text-text-tech uppercase tracking-widest font-bold">System Metadata Matrix</span>
            </div>

            <div className="grid grid-cols-2 gap-y-4 gap-x-6 font-sans text-xs">
              <div className="space-y-1">
                <span className="font-mono text-[8px] text-text-mute uppercase block">Role</span>
                <span className="text-foreground font-semibold font-mono">{project.role}</span>
              </div>
              <div className="space-y-1">
                <span className="font-mono text-[8px] text-text-mute uppercase block">Status</span>
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${project.status === "Production" ? "bg-emerald-500" : "bg-blue-500"} animate-pulse`} />
                  <span className="text-foreground font-semibold font-mono uppercase">{project.status}</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="font-mono text-[8px] text-text-mute uppercase block">Difficulty Level</span>
                <span className="text-gold font-semibold font-mono uppercase">{project.difficulty}</span>
              </div>
              <div className="space-y-1">
                <span className="font-mono text-[8px] text-text-mute uppercase block">Architecture Style</span>
                <span className="text-foreground font-semibold font-mono uppercase">{project.architectureStyle}</span>
              </div>
              <div className="space-y-1">
                <span className="font-mono text-[8px] text-text-mute uppercase block">Cloud Provider</span>
                <span className="text-foreground font-semibold font-mono uppercase">{project.cloudProvider}</span>
              </div>
              <div className="space-y-1">
                <span className="font-mono text-[8px] text-text-mute uppercase block">Deployment Version</span>
                <span className="text-foreground font-semibold font-mono">{project.version}</span>
              </div>
            </div>

            {/* Links HUD */}
            <div className="border-t border-border-mute pt-4 mt-5 flex gap-4 font-mono text-[9px] text-text-tech">
              {project.links.github && (
                <a 
                  href={project.links.github} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-1.5 hover:text-gold transition-colors"
                >
                  <Github className="w-3.5 h-3.5 text-foreground" />
                  <span>REPOSITORY</span>
                </a>
              )}
              {project.links.live && (
                <a 
                  href={project.links.live} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-1.5 hover:text-gold transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-gold" />
                  <span>LIVE_DEPLOY</span>
                </a>
              )}
            </div>
          </GlassPanel>
        </div>

        {/* RIGHT COLUMN: Scrolling Prose Editorial Journal & Table of Contents */}
        <div className="w-full lg:w-[52%] flex flex-col lg:flex-row gap-6 items-start overflow-visible">
          
          {/* Scrollable Editorial Reading Frame */}
          <div 
            ref={containerRef}
            className="flex-grow w-full space-y-6 select-text selection:bg-gold/15"
          >
            {/* Journal Intro Panel */}
            <div className="space-y-3 pb-6 border-b border-border-mute">
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 bg-surface-alt border border-border-mute text-[9px] font-mono text-text-tech uppercase font-bold rounded">
                  {project.category}
                </span>
                <div className="flex items-center gap-1 font-mono text-[9px] text-text-mute">
                  <Clock className="w-3.5 h-3.5 text-gold" />
                  <span>5 MIN READ</span>
                </div>
              </div>
              <h1 className="font-sans font-medium text-3xl text-foreground tracking-tight leading-none mt-2">
                {project.title}
              </h1>
              <p className="text-sm text-text-mute leading-relaxed">
                {project.subtitle}
              </p>
            </div>

            {/* Rendered Journal Content via custom parser */}
            <div className="prose prose-neutral dark:prose-invert max-w-none text-xs leading-relaxed text-text-mute">
              {parseMarkdownContent(project.content)}
            </div>

            {/* Embedded Interactive Latency Slider Primitive in Metrics section */}
            <div className="my-10 space-y-3">
              <span className="font-mono text-[9px] text-gold uppercase tracking-wider font-bold">[ Interactive telemetry simulation ]</span>
              <ComparisonSlider 
                beforeTitle="TRADITIONAL CLOUD WORKLOAD" 
                afterTitle="COGNITIVE EDGE ROUTING SYSTEM"
                beforeLabel="High Latency Lockouts"
                afterLabel="12ms Batched Event Flow"
              />
            </div>

            {/* Section 8: AI RAG interrogation panel */}
            <div className="border-t border-border-mute pt-10 mt-12 space-y-6">
              <div className="space-y-2">
                <span className="text-technical-caption text-gold uppercase font-mono tracking-widest">[ Grounded AI Interrogation ]</span>
                <h3 className="font-sans font-medium text-lg text-foreground tracking-tight">Interrogate this Blueprint</h3>
                <p className="text-xs text-text-mute leading-relaxed font-sans">
                  Query Virtual Cole regarding this project. These answers are grounded strictly in this document's verified architecture schemas, refusing hallucination.
                </p>
              </div>

              {/* RAG Dialog box */}
              <GlassPanel className="p-6 border-gold/20 flex flex-col justify-between min-h-[260px] relative overflow-hidden" intensity="medium">
                <div className="flex items-center justify-between border-b border-border-mute pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-mono font-bold uppercase">Virtual Cole v1.2</span>
                  </div>
                  <span className="text-[9px] font-mono text-text-tech uppercase">Grounded Context</span>
                </div>

                <div className="my-6 space-y-4 text-xs flex-grow flex flex-col justify-center">
                  {chatStep === "idle" ? (
                    <div className="text-center p-4 border border-dashed border-border-mute rounded-medium space-y-2">
                      <HelpCircle className="w-5 h-5 text-gold/60 mx-auto animate-bounce" />
                      <p className="font-mono text-[8.5px] text-text-tech uppercase">Select one of the query presets below to trigger semantic extraction.</p>
                    </div>
                  ) : (
                    <>
                      {/* Visitor query */}
                      <div className="flex gap-2 bg-surface p-3 rounded-medium border border-border-mute max-w-[85%] self-start font-sans">
                        <span className="font-bold select-none">Visitor:</span>
                        <span className="text-text-mute">{selectedQuestion}</span>
                      </div>

                      {/* AI Thinking */}
                      {chatStep === "thinking" && (
                        <div className="flex gap-2 bg-gold/5 p-3 rounded-medium border border-gold/10 max-w-[85%] ml-auto items-center">
                          <RotateCw className="w-3.5 h-3.5 animate-spin text-gold" />
                          <span className="font-mono text-[8px] text-text-tech uppercase tracking-wide animate-pulse">
                            Querying Vectorize Index & D1 database...
                          </span>
                        </div>
                      )}

                      {/* AI Answer */}
                      {(chatStep === "streaming" || chatStep === "done") && (
                        <div className="flex flex-col gap-2 bg-gold/5 p-3.5 rounded-medium border border-gold/15 max-w-[90%] ml-auto">
                          <div className="flex gap-2">
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

                {/* Preset question selector */}
                <div className="flex flex-col gap-2 border-t border-border-mute pt-4">
                  {project.virtualColeQuestions.map((q: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => handlePresetQuestion(q)}
                      disabled={chatStep === "thinking" || chatStep === "streaming"}
                      className={`px-3 py-2 text-left text-xs rounded border transition-all duration-200 cursor-pointer ${
                        selectedQuestion === q
                          ? "bg-gold/10 border-gold text-foreground font-medium"
                          : "bg-surface border-border-strong hover:border-text-mute text-text-mute hover:text-foreground"
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </GlassPanel>
            </div>
          </div>

          {/* TABLE OF CONTENTS SIDEBAR (Desktop Only) */}
          <div className="hidden xl:block w-40 sticky top-24 flex-shrink-0 font-mono text-[9px] text-text-mute space-y-4">
            <div className="flex items-center gap-1.5 border-b border-border-mute pb-2 text-text-tech uppercase font-bold">
              <BookmarkIcon className="w-3 h-3 text-gold" />
              <span>JOURNAL_MAP</span>
            </div>
            
            <div className="flex flex-col gap-3.5">
              {tocHeadings.map((heading: { title: string; id: string }) => {
                const isActive = activeHeading === heading.id;
                return (
                  <button
                    key={heading.id}
                    onClick={() => {
                      const el = document.getElementById(heading.id);
                      if (el) {
                        el.scrollIntoView({ behavior: "smooth", block: "start" });
                      }
                    }}
                    className={`text-left hover:text-foreground transition-colors duration-150 focus:outline-none flex items-start gap-1.5 cursor-pointer ${
                      isActive ? "text-gold font-bold translate-x-0.5" : ""
                    }`}
                  >
                    <ChevronRight className={`w-3 h-3 mt-0.5 transition-transform ${isActive ? "rotate-90 text-gold" : "text-border-strong"}`} />
                    <span>{heading.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Floating global back navigation dock */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <GlassPanel className="px-6 py-3 border-border-strong rounded-full shadow-premium-2 flex items-center gap-4" intensity="high">
          <Link href="/projects" className="group flex items-center gap-2 font-mono text-[10px] text-text-mute hover:text-foreground transition-colors">
            <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
            <span>RETURN_TO_PROJECT_BROWSER</span>
          </Link>
        </GlassPanel>
      </div>
    </div>
  );
}

// Simple localized Bookmark Icon to keep things zero-dependency
function BookmarkIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
    </svg>
  );
}
