"use client";

import React from "react";
import { motion, Variants } from "motion/react";
import { ArrowUpRight, Cpu, Network, ShieldCheck, Zap } from "lucide-react";

export interface Project {
  id: string;
  slug: string;
  category: string;
  title: string;
  description: string;
  latencyMetric: string;
  scaleMetric: string;
  techStack: string[];
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
}

const projects: Project[] = [
  {
    id: "proj_1",
    slug: "distributed-cognitive-router",
    category: "AI Routing Systems",
    title: "Distributed Cognitive Semantic Router",
    description: "Sub-40ms serverless inference gateway performing in-context query classification and local vector pre-routing. Eliminates redundant LLM compute cycles by intercepting repeated patterns directly at the edge boundary.",
    latencyMetric: "38ms p95",
    scaleMetric: "92% compute saved",
    techStack: ["Cloudflare KV", "Gemini API", "Edge Isolates"],
    icon: Cpu,
    accentColor: "text-[#0070F3] bg-[#0070F3]/5 border-[#0070F3]/10 hover:shadow-[#0070F3]/5",
  },
  {
    id: "proj_2",
    slug: "global-event-log-sync",
    category: "Database Engineering",
    title: "Zero-Latency D1 Event Log Synchronizer",
    description: "Distributed SQLite transactional synchronization scheme. Manages real-time write consolidation and edge audit trails with strict eventual consistency, avoiding centralized database contention bottlenecks.",
    latencyMetric: "12ms Write Consolidation",
    scaleMetric: "1.2M logs/sec Peak",
    techStack: ["Cloudflare D1", "Drizzle ORM", "TypeScript"],
    icon: Network,
    accentColor: "text-amber-600 bg-amber-500/5 border-amber-500/10 hover:shadow-amber-500/5",
  },
  {
    id: "proj_3",
    slug: "boundary-shield-waf",
    category: "Security & WAF",
    title: "Boundary Shield Edge Firewall",
    description: "High-throughput serverless Web Application Firewall screening dynamic telemetry streams for nested SQL injection or payload contamination. Runs compiled Rust WASM binary decoders directly in the Cloudflare request pipeline.",
    latencyMetric: "1.8ms Overhead",
    scaleMetric: "99.99% accuracy",
    techStack: ["Rust WASM", "Cloudflare Workers", "RegEx Engines"],
    icon: ShieldCheck,
    accentColor: "text-purple-600 bg-purple-500/5 border-purple-500/10 hover:shadow-purple-500/5",
  },
];

interface ProjectShowcaseGridProps {
  onProjectSelect?: (slug: string) => void;
}

export default function ProjectShowcaseGrid({ onProjectSelect }: ProjectShowcaseGridProps) {
  // Stagger variants for smooth card loading sequences
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 24,
      },
    },
  };

  return (
    <div id="project-showcase-section" className="space-y-6">
      <div className="flex items-end justify-between border-b border-black/[0.04] pb-4">
        <div>
          <h2 className="font-display font-medium text-xl text-gray-900 tracking-tight">System Blueprints</h2>
          <p className="text-xs text-gray-500 font-mono mt-0.5 tracking-wider">HIGH-PERFORMANCE ARCHITECTURES IN ACTIVE PROD</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-[#0070F3] font-semibold">
          <Zap className="w-3.5 h-3.5 animate-pulse" />
          <span>BENTO_GRID_V2.0</span>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {projects.map((project) => {
          const IconComponent = project.icon;
          return (
            <motion.div
              key={project.id}
              id={`project-card-${project.slug}`}
              variants={cardVariants}
              onClick={() => onProjectSelect?.(project.slug)}
              className={`group relative bg-white border border-black/[0.06] rounded-2xl p-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-lg hover:border-black/[0.12] transition-all duration-300 flex flex-col justify-between min-h-[250px] cursor-pointer ${project.accentColor}`}
            >
              {/* Card top branding */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 text-[9px] font-mono rounded font-bold uppercase tracking-wider bg-black/[0.02]">
                    {project.category}
                  </span>
                  <div className="p-1.5 rounded-full bg-black/[0.02] group-hover:bg-black/5 transition-colors">
                    <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" />
                  </div>
                </div>

                <div className="flex items-start gap-3 mt-4">
                  <div className="p-2.5 rounded-xl bg-black/[0.01] border border-black/[0.03] text-gray-700">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-medium text-lg leading-snug text-gray-900 transition-colors">
                    {project.title}
                  </h3>
                </div>

                <p className="text-xs text-gray-600 mt-3.5 leading-relaxed font-sans line-clamp-4">
                  {project.description}
                </p>
              </div>

              {/* Staggered bottom metrics telemetry */}
              <div className="pt-4 border-t border-black/[0.03] mt-5 flex flex-wrap gap-2 items-center justify-between text-[10px] font-mono text-gray-500">
                <div className="flex items-center gap-1">
                  <span className="text-gray-400">LATENCY:</span>
                  <span className="text-black font-semibold">{project.latencyMetric}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-gray-400">IMPACT:</span>
                  <span className="text-black font-semibold">{project.scaleMetric}</span>
                </div>
              </div>

              {/* Interactive micro-glow border */}
              <div className="absolute inset-0 rounded-2xl pointer-events-none border border-transparent group-hover:border-inherit transition-all duration-300" />
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
