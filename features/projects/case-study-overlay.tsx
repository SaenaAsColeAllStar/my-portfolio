"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ArrowLeft, Terminal, Activity } from "lucide-react";
import SVGArchitectureViewer from "./svg-architecture-viewer";
import EditorialNarrativeFrame from "./editorial-narrative-frame";

interface CaseStudyOverlayProps {
  projectSlug: string;
  onClose: () => void;
}

// Fluent spring preset from Cole.dev Motion System Playbook
const fluentSpring = {
  type: "spring" as const,
  stiffness: 240,
  damping: 28,
  mass: 1.0,
};

const fadeVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export default function CaseStudyOverlay({ projectSlug, onClose }: CaseStudyOverlayProps) {
  
  // Lock underlying body scroll when detail mode is active
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <motion.div
      id="case-study-overlay-backdrop"
      variants={fadeVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 bg-[#FAF9F6]/95 dark:bg-[#0B0B0B]/95 backdrop-blur-xl z-50 flex flex-col overflow-hidden"
    >
      {/* Top Floating Control Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between border-b border-black/[0.04] dark:border-white/[0.04]">
        
        {/* Dynamic Back Handshake Button */}
        <button
          onClick={onClose}
          id="case-study-close-btn-back"
          className="group flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-[#111111] hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black border border-black/[0.06] dark:border-white/[0.06] rounded-full text-xs font-mono font-medium transition-all duration-300"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
          <span>RETURN_TO_SYSTEMS</span>
        </button>

        {/* Telemetry Indicator */}
        <div className="flex items-center gap-4 text-xs font-mono text-gray-500">
          <div className="hidden sm:flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0070F3] animate-pulse" />
            <span>NODE: ANALYTICAL_OVERLAY_ACTIVE</span>
          </div>
          <div className="flex items-center gap-1.5 border-l border-black/10 dark:border-white/10 pl-4">
            <Activity className="w-3.5 h-3.5 text-[#0070F3]" />
            <span className="text-black dark:text-white font-semibold uppercase">{projectSlug.replace(/-/g, " ")}</span>
          </div>
        </div>

        {/* Direct Circular Close Button */}
        <button
          onClick={onClose}
          id="case-study-close-btn-direct"
          className="p-2.5 bg-white dark:bg-[#111111] border border-black/[0.06] dark:border-white/[0.06] hover:bg-red-500 hover:text-white hover:border-red-500 rounded-full transition-colors focus:outline-none"
          title="Exit Detail View"
        >
          <X className="w-4 h-4" />
        </button>
      </header>

      {/* Dual Panel Split-Screen Canvas */}
      <main className="relative flex-grow max-w-7xl w-full mx-auto p-6 flex flex-col lg:flex-row gap-6 overflow-hidden">
        
        {/* Left Column: Interactive SVG Topology Diagram */}
        <motion.div
          id="case-study-left-topology"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={fluentSpring}
          className="w-full lg:w-[48%] h-[400px] lg:h-full flex-shrink-0"
        >
          <SVGArchitectureViewer projectSlug={projectSlug} />
        </motion.div>

        {/* Right Column: Editorial Narrative Reading Frame */}
        <motion.div
          id="case-study-right-editorial"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={fluentSpring}
          className="w-full lg:w-[52%] h-[500px] lg:h-full flex-grow overflow-hidden"
        >
          <EditorialNarrativeFrame projectSlug={projectSlug} />
        </motion.div>

      </main>
    </motion.div>
  );
}
