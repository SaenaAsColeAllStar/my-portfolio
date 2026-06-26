"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, useScroll, useSpring, Variants } from "motion/react";
import { 
  Calendar, 
  Layers, 
  Database, 
  ShieldAlert, 
  Cpu, 
  ExternalLink,
  GitBranch,
  Award
} from "lucide-react";

export interface TimelineEvent {
  id: string;
  year: string;
  date: string;
  title: string;
  roleOrContext: string;
  companyOrProject: string;
  description: string;
  category: "ai" | "database" | "security" | "cloud";
  technologiesUsed: string[];
  links?: { label: string; actionView?: string; projectSlug?: string; url?: string }[];
}

const timelineEvents: TimelineEvent[] = [
  {
    id: "lead-ai-cognitive-router",
    year: "2026",
    date: "MARCH 2026",
    title: "Lead AI & Cognitive Router Architect",
    roleOrContext: "System Orchestrator & Principal Researcher",
    companyOrProject: "Cole.dev Lab Experiments",
    description: "Designed a sub-40ms semantic router running at the Cloudflare Edge, leveraging Gemini 3.5 Flash for query classification and Cloudflare KV for global response caching, achieving a 92% reduction in overall generative inference overhead.",
    category: "ai",
    technologiesUsed: ["Gemini 3.5 Flash", "Cloudflare Edge", "KV", "Next.js"],
    links: [
      { label: "Trace Architecture", projectSlug: "distributed-cognitive-router" }
    ]
  },
  {
    id: "d1-event-sync",
    year: "2025",
    date: "NOVEMBER 2025",
    title: "Database Systems Architect",
    roleOrContext: "Distributed Database Optimization Lead",
    companyOrProject: "Enterprise Log Streams Integration",
    description: "Built a zero-latency distributed SQLite synchronizer leveraging Cloudflare D1 with Drizzle ORM batch serialization pipelines. Designed write-consolidation queues that eliminated write lockout collisions (SQLITE_BUSY) under traffic loads up to 100k concurrent events per second.",
    category: "database",
    technologiesUsed: ["Cloudflare D1", "Drizzle ORM", "SQLite Batching", "Workers Queue"],
    links: [
      { label: "Inspect D1 Schema", projectSlug: "global-event-log-sync" }
    ]
  },
  {
    id: "boundary-shield-waf-rust",
    year: "2025",
    date: "JUNE 2025",
    title: "Security Engineering Specialist",
    roleOrContext: "WAF Proxy Designer",
    companyOrProject: "ColeAllStar Cloud Perimeter",
    description: "Created Boundary Shield WAF, compiling dynamic RegExp payload screening rules into Rust WebAssembly (WASM) binaries executed directly on edge isolations. Achieved sub-1.2ms validation overheads, screening telemetry streams before backend persistence cycles.",
    category: "security",
    technologiesUsed: ["Compiled Rust", "WASM", "Cloudflare Pages Isolates", "HTTPS Stream Validation"],
    links: [
      { label: "Audit Security Gates", projectSlug: "boundary-shield-waf" }
    ]
  },
  {
    id: "serverless-cdn-scaling",
    year: "2024",
    date: "OCTOBER 2024",
    title: "Senior Cloud Infrastructure Developer",
    roleOrContext: "Performance Engineering Lead",
    companyOrProject: "Global Content Delivery Networks",
    description: "Implemented serverless micro-routing boundaries and reverse proxy caches with smart geo-replication systems. Optimized average Time-To-First-Byte (TTFB) from 180ms down to 12ms globally.",
    category: "cloud",
    technologiesUsed: ["Anycast Routing", "Serverless Isolate Pipelines", "Redis Edge Caching", "Drizzle ORM"],
  },
  {
    id: "cognitive-rag-pioneer",
    year: "2023",
    date: "FEBRUARY 2023",
    title: "AI Engineer & RAG Architect",
    roleOrContext: "Early LLM Implementation Specialist",
    companyOrProject: "Smart Context Pipelines",
    description: "Engineered robust semantic search indexes using Pinecone and localized embedding vectors. Designed metadata filter strategies and context grounding mechanisms that successfully reduced LLM output hallucination rates to less than 0.5%.",
    category: "ai",
    technologiesUsed: ["Pinecone Vector Store", "Sentence Embeddings", "Semantic Re-ranking", "LangChain"],
  },
];

const categoryIconMap = {
  ai: Cpu,
  database: Database,
  security: ShieldAlert,
  cloud: GitBranch,
};

interface ChronoTrajectoryProps {
  onProjectSelect?: (slug: string) => void;
}

export default function ChronoTrajectory({ onProjectSelect }: ChronoTrajectoryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollLineRef = useRef<HTMLDivElement>(null);
  
  // Track scroll position of the window or containing block
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    if (scrollHeight - clientHeight <= 0) {
      setScrollProgress(0);
    } else {
      setScrollProgress(scrollTop / (scrollHeight - clientHeight));
    }
  };

  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.addEventListener("scroll", handleScroll);
      // Run once on load
      handleScroll();
    }
    return () => el?.removeEventListener("scroll", handleScroll);
  }, []);

  const getCategoryIcon = (category: TimelineEvent["category"]) => {
    return categoryIconMap[category] || Cpu;
  };

  // Entry transitions for timeline cards
  const cardVariants: Variants = {
    hidden: { opacity: 0, x: -18 },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { 
        type: "spring", 
        stiffness: 260, 
        damping: 24 
      } 
    }
  };

  return (
    <div className="w-full h-full max-w-4xl mx-auto flex flex-col justify-between select-none">
      
      {/* Timeline Introductory Panel */}
      <div className="space-y-3 mb-10">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/10 text-amber-600 font-mono text-[9px] font-bold uppercase tracking-wider rounded">
          <Calendar className="w-3 h-3" />
          <span>Chronological Trajectory</span>
        </div>
        <h2 className="font-display font-medium text-3xl text-gray-900 dark:text-white tracking-tight">
          System Milestone Chronicles
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
          Tracing Cole&apos;s real-world developmental timeline, showcasing historical execution, core roles, and distributed microservices architecture deployments.
        </p>
      </div>

      {/* Main Trajectory Scroll Container */}
      <div 
        ref={containerRef}
        className="relative flex-grow overflow-y-auto max-h-[650px] scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-neutral-800 pr-2 pb-10"
      >
        <div className="relative pl-8 ml-4">
          
          {/* Vertical Tracking Rail */}
          <div className="absolute left-0 top-3 bottom-3 w-[1px] bg-black/[0.08] dark:bg-white/[0.08]" />
          
          {/* Dynamic Scroll-Linked Progress Line (Fills downward precisely) */}
          <div 
            ref={scrollLineRef}
            className="absolute left-0 top-3 w-[1.5px] bg-[#0070F3] transition-all duration-75"
            style={{ 
              height: `${scrollProgress * 98}%`,
              boxShadow: "0 0 8px rgba(0, 112, 243, 0.4)" 
            }}
          />

          {/* List of Chrono Milestones */}
          <div className="space-y-12">
            {timelineEvents.map((event, idx) => {
              const Icon = getCategoryIcon(event.category);
              
              return (
                <motion.div
                  key={event.id}
                  id={`milestone-${event.id}`}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-12% 0px" }}
                  variants={cardVariants}
                  className="relative space-y-3"
                >
                  
                  {/* Outer active node indicator */}
                  <div className="absolute -left-[41px] top-1.5 z-10">
                    <motion.div
                      className={`w-6 h-6 rounded-full bg-white dark:bg-[#111111] border flex items-center justify-center transition-colors duration-300 ${
                        scrollProgress * timelineEvents.length >= idx 
                          ? "border-[#0070F3] text-[#0070F3]" 
                          : "border-gray-200 dark:border-gray-800 text-gray-400"
                      }`}
                      whileHover={{ scale: 1.15 }}
                    >
                      <Icon className="w-3 h-3" />
                    </motion.div>
                  </div>

                  {/* Header Title Section */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5 font-mono text-[9px] font-bold">
                      <span className="text-[#0070F3] bg-[#0070F3]/5 px-1.5 py-0.5 rounded font-bold">
                        {event.year}
                      </span>
                      <span className="text-gray-400">|</span>
                      <span className="text-gray-500 uppercase tracking-wider">{event.date}</span>
                    </div>

                    <h3 className="font-display font-medium text-lg text-gray-900 dark:text-white leading-tight">
                      {event.title}
                    </h3>

                    <div className="font-mono text-[10px] text-gray-400">
                      CONTEXT: <span className="text-black dark:text-white font-medium">{event.companyOrProject}</span> — <span className="italic">{event.roleOrContext}</span>
                    </div>
                  </div>

                  {/* Editorial description cards with clear margins */}
                  <div className="bg-white dark:bg-[#111111] border border-black/[0.04] dark:border-white/[0.04] hover:border-black/[0.08] rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.01)] max-w-3xl">
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-sans">
                      {event.description}
                    </p>

                    {/* Meta Technology Badges */}
                    <div className="flex flex-wrap gap-1.5 pt-4 border-t border-black/[0.03] dark:border-white/[0.03] mt-4">
                      {event.technologiesUsed.map((tech, techIdx) => (
                        <span 
                          key={techIdx} 
                          className="px-2 py-0.5 bg-black/[0.01] dark:bg-white/[0.01] border border-black/[0.03] dark:border-white/[0.03] rounded-md text-[8px] font-mono text-gray-500"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* Dynamic Action Links */}
                    {event.links && event.links.length > 0 && (
                      <div className="flex gap-4 pt-3 mt-1.5">
                        {event.links.map((link, linkIdx) => (
                          <button
                            key={linkIdx}
                            onClick={() => {
                              if (link.projectSlug && onProjectSelect) {
                                onProjectSelect(link.projectSlug);
                              }
                            }}
                            className="inline-flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase tracking-wider text-[#0070F3] hover:text-blue-700 transition-colors cursor-pointer"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>{link.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                </motion.div>
              );
            })}
          </div>

        </div>
      </div>

      {/* Trajectory Tracker Footer */}
      <div className="border-t border-black/[0.04] dark:border-white/[0.04] pt-3.5 flex items-center justify-between text-[10px] font-mono text-gray-400 select-none">
        <div className="flex items-center gap-1.5">
          <Award className="w-4 h-4 text-amber-500 animate-pulse" />
          <span>SYS_METRICS: MILESTONES_SOLIDIFIED</span>
        </div>
        <span>TRAJECTORY_HEIGHT: {Math.round(scrollProgress * 100)}%</span>
      </div>
    </div>
  );
}
