"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, 
  Activity, 
  ChevronRight,
  Clock,
  RotateCw,
  ShieldAlert,
  HelpCircle
} from "lucide-react";

// Import platform, design primitives, and features using relative paths
import type { ProjectSlug } from "./domain/project-catalog"; // Reuses catalog slugs
import { cmsClient as platformCms, type Project as PlatformProject } from "../../src/shared/lib/cms/cms-client";
import { Terminal } from "../../src/shared/components/ui/terminal";
import ComparisonSlider from "./comparison-slider";
import { GlassPanel } from "../../src/shared/components/ui/glass-panel";

interface EditorialNarrativeFrameProps {
  projectSlug: string;
}

// Utility to slugify heading titles for anchor linking
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .trim();
}

export default function EditorialNarrativeFrame({ projectSlug }: EditorialNarrativeFrameProps) {
  const [project, setProject] = useState<PlatformProject | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Local RAG chat simulator states
  const [chatStep, setChatStep] = useState<"idle" | "thinking" | "streaming" | "done">("idle");
  const [displayedAnswer, setDisplayedAnswer] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);

  // Load project details dynamically from edge-compatible CMS client
  useEffect(() => {
    platformCms.getProjectBySlug(projectSlug).then((res: PlatformProject | null) => {
      if (res) {
        setProject(res);
        // Reset scroll position on project change
        if (containerRef.current) containerRef.current.scrollTop = 0;
      }
    });
  }, [projectSlug]);

  // Update dynamic reading progress line on scroll
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

  // RAG Chat Simulation trigger
  const handlePresetQuestion = (question: string) => {
    if (!project || chatStep === "thinking" || chatStep === "streaming") return;
    setSelectedQuestion(question);
    setChatStep("thinking");
    setDisplayedAnswer("");

    // Find answer matching the project specifics
    let answerText = "Information retrieved from secure edge context.";
    if (question.includes("latency") || question.includes("average")) {
      answerText = `The system achieves an average p95 RTT latency of ${project.latencyMetric}. This is guaranteed by combining local Cloudflare KV semantic caches (which respond in under 12ms) with lightweight Gemini Flash pre-routers. [Sources: Architecture Specs, ADR-009]`;
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

  if (!project) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-white dark:bg-[#111111] border border-border-strong rounded-2xl">
        <Activity className="w-5 h-5 animate-spin text-gold" />
      </div>
    );
  }

  // Custom Edge-Native Markdown Parser to convert raw Markdown into React Design system primitives
  const parseMarkdownContent = (markdownText: string) => {
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
            className="font-sans font-medium text-xs text-gold mt-8 mb-3.5 border-b border-border-strong pb-2 tracking-widest uppercase font-mono"
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
            className="font-sans font-medium text-xs text-foreground mt-6 mb-3 tracking-tight font-semibold"
          >
            {text}
          </h3>
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
          <div key={idx} className="my-5">
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
          <div key={idx} className="my-5 p-4 bg-gold/5 border border-gold/15 rounded-medium flex gap-3">
            <ShieldAlert className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed text-text-mute space-y-1 font-sans">
              <strong className="text-foreground uppercase font-mono text-[8px] tracking-wider block">{alertType}</strong>
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
        const dataRows = rows.slice(2);
        
        return (
          <div key={idx} className="my-5 overflow-x-auto border border-border-strong rounded-large shadow-sm">
            <table className="w-full text-[11px] font-mono text-left border-collapse bg-surface/30">
              <thead>
                <tr className="border-b border-border-strong text-text-mute bg-surface-alt/50">
                  {headers.map((h, i) => (
                    <th key={i} className="p-2.5 font-semibold uppercase text-[8px] tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataRows.map((row, rIdx) => (
                  <tr key={rIdx} className="border-b border-border-mute/50 last:border-0 hover:bg-surface-alt/20 transition-colors">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-2.5 text-text-mute">{cell}</td>
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
        const items = trimmed.split(/\n[*\-]\s+/).map(item => item.replace(/^[*\-]\s+/, "").trim());
        return (
          <ul key={idx} className="list-disc pl-4 my-4 space-y-1.5 text-[11px] text-text-mute leading-relaxed font-sans">
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
          className="text-[11px] text-text-mute leading-relaxed my-3 font-sans whitespace-pre-line"
          dangerouslySetInnerHTML={{
            __html: trimmed
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 bg-surface border border-border-mute font-mono text-[9px] rounded text-foreground">$1</code>')
          }}
        />
      );
    });
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-white dark:bg-[#111111] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] overflow-hidden shadow-premium-1">
      
      {/* Top Reading Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-black/[0.03] dark:bg-white/[0.03] z-25">
        <motion.div 
          className="h-full bg-gold"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Narrative Header Section */}
      <div className="px-6 pt-6 pb-4 border-b border-black/[0.04] dark:border-white/[0.04] space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded text-[9px] font-mono font-bold uppercase tracking-wider text-gold">
            {project.category}
          </span>
          <div className="flex items-center gap-1 font-mono text-[9px] text-gray-400">
            <Clock className="w-3.5 h-3.5" />
            <span>5 MIN READ</span>
          </div>
          <span className="text-gray-300 dark:text-neutral-700 font-sans">|</span>
          <span className="font-mono text-[9px] text-text-tech uppercase">VERSION: {project.version}</span>
        </div>
        
        <h2 className="font-display font-medium text-lg text-gray-900 dark:text-white tracking-tight">
          {project.title}
        </h2>
        <p className="text-xs text-gray-500 leading-normal">
          {project.subtitle}
        </p>
      </div>

      {/* Scrolling Content Canvas */}
      <div 
        ref={containerRef}
        className="flex-grow overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-neutral-800 space-y-6 select-text selection:bg-gold/15"
      >
        {/* Dynamic Parsed Markdown Narrative */}
        <div className="prose prose-neutral dark:prose-invert max-w-none text-[11px] leading-relaxed text-text-mute">
          {parseMarkdownContent(project.content)}
        </div>

        {/* Embedded Before/After Latency Slider */}
        <div className="pt-4">
          <ComparisonSlider 
            beforeTitle="TRADITIONAL CLOUD WORKLOAD" 
            afterTitle="COGNITIVE EDGE DEPLOYMENT"
            beforeLabel="High Latency Lockouts"
            afterLabel="12ms Batched Event Flow"
          />
        </div>

        {/* Dynamic Grounded AI Interrogator (Virtual Cole) */}
        <div className="border-t border-border-mute pt-6 mt-8 space-y-4">
          <div className="space-y-1.5">
            <span className="text-technical-caption text-gold uppercase font-mono tracking-widest block">[ Grounded AI Handshake ]</span>
            <h4 className="font-sans font-semibold text-xs text-foreground tracking-tight">Interrogate this System</h4>
            <p className="text-[10px] text-text-mute leading-relaxed font-sans">
              Interrogate Virtual Cole regarding this specific blueprint. Answers are extracted directly from the system specification.
            </p>
          </div>

          <GlassPanel className="p-5 border-gold/15 flex flex-col justify-between min-h-[220px]" intensity="medium">
            <div className="flex items-center justify-between border-b border-border-mute pb-2.5">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-mono font-bold uppercase">Virtual Cole v1.2</span>
              </div>
              <span className="text-[8.5px] font-mono text-text-tech uppercase">Grounded Context</span>
            </div>

            <div className="my-4 text-[11px] flex-grow flex flex-col justify-center space-y-3">
              {chatStep === "idle" ? (
                <div className="text-center py-4 border border-dashed border-border-mute rounded-medium space-y-1.5">
                  <HelpCircle className="w-4 h-4 text-gold/60 mx-auto animate-bounce" />
                  <p className="font-mono text-[8px] text-text-tech uppercase">Select a question below to run RAG context validation.</p>
                </div>
              ) : (
                <>
                  {/* Visitor box */}
                  <div className="flex gap-2 bg-surface p-2.5 rounded-medium border border-border-mute max-w-[85%] self-start font-sans">
                    <span className="font-bold select-none">Visitor:</span>
                    <span className="text-text-mute">{selectedQuestion}</span>
                  </div>

                  {/* Thinking state */}
                  {chatStep === "thinking" && (
                    <div className="flex gap-2 bg-gold/5 p-2.5 rounded-medium border border-gold/10 max-w-[85%] ml-auto items-center">
                      <RotateCw className="w-3.5 h-3.5 animate-spin text-gold" />
                      <span className="font-mono text-[8px] text-text-tech uppercase tracking-wide animate-pulse">
                        Resolving embeddings...
                      </span>
                    </div>
                  )}

                  {/* Answer streaming */}
                  {(chatStep === "streaming" || chatStep === "done") && (
                    <div className="flex flex-col gap-1.5 bg-gold/5 p-3 rounded-medium border border-gold/15 max-w-[90%] ml-auto">
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

            {/* Questions list */}
            <div className="flex flex-col gap-1.5 border-t border-border-mute pt-3">
              {project.virtualColeQuestions.map((q: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => handlePresetQuestion(q)}
                  disabled={chatStep === "thinking" || chatStep === "streaming"}
                  className={`px-2.5 py-1.5 text-left text-[10px] rounded border transition-all duration-150 cursor-pointer ${
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

      {/* Progress Footer indicator */}
      <div className="border-t border-black/[0.03] dark:border-white/[0.03] px-6 py-3.5 bg-black/[0.01] dark:bg-white/[0.01] flex items-center justify-between text-[10px] font-mono text-gray-400 select-none">
        <div className="flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-gold" />
          <span>Section Coordinate: II</span>
        </div>
        <span>READ_PROGRESS: {Math.round(scrollProgress)}%</span>
      </div>
    </div>
  );
}
