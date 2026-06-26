"use client";

import React from "react";
import { motion, Variants } from "motion/react";
import { ArrowUpRight, Zap } from "lucide-react";
import { projectSummaries, type ProjectSlug } from "@/domain/portfolio/projects";

interface ProjectShowcaseGridProps {
  onProjectSelect?: (slug: ProjectSlug) => void;
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
        {projectSummaries.map((project) => {
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
