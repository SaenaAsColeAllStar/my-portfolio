"use client";

import { Suspense, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Activity, ArrowRight, Sparkles } from "lucide-react";
import NavigationDock from "@/components/navigation-dock";
import NeuralSynapseCanvas from "@/features/dashboard/neural-synapse-canvas";
import ProjectShowcaseGrid from "@/features/dashboard/project-showcase-grid";
import CaseStudyOverlay from "@/features/projects/case-study-overlay";
import IntellectNotebook from "@/features/notebook/intellect-notebook";
import ChronoTrajectory from "@/features/timeline/chrono-trajectory";
import VirtualColeAssistant from "@/features/assistant/virtual-cole-assistant";

type PortfolioView = "dashboard" | "notebook" | "timeline" | "assistant" | "contact";

const portfolioViews = ["dashboard", "notebook", "timeline", "assistant", "contact"] as const;

function isPortfolioView(value: string | null): value is PortfolioView {
  return Boolean(value && (portfolioViews as readonly string[]).includes(value));
}

// Standard loading component for Suspense
function Loader() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#FAF9F6] text-black">
      <div className="flex flex-col items-center gap-3">
        <Activity className="h-6 w-6 animate-pulse text-[#0070F3]" />
        <span className="font-mono text-xs text-gray-500 tracking-wider">SYSTEM_BOOTING...</span>
      </div>
    </div>
  );
}

function PageContent() {
  const [currentView, setCurrentView] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get("view");
      if (isPortfolioView(viewParam)) {
        return viewParam;
      }
    }
    return "dashboard";
  });
  const [selectedProjectSlug, setSelectedProjectSlug] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("project");
    }
    return null;
  });
  const [latency, setLatency] = useState("0ms");

  // Sync with URL query parameters manually in a client-safe way without breaking static exports
  useEffect(() => {
    // Measure a mock edge response latency to feed into the Telemetry HUD
    const start = performance.now();
    setTimeout(() => {
      const end = performance.now();
      setLatency(`${Math.round(end - start)}ms`);
    }, 45);
  }, []);

  const handleViewChange = (view: PortfolioView) => {
    setCurrentView(view);
    const newUrl = `${window.location.pathname}?view=${view}`;
    window.history.pushState({ path: newUrl }, "", newUrl);
  };

  const handleCloseProject = () => {
    setSelectedProjectSlug(null);
    const newUrl = `${window.location.pathname}?view=${currentView}`;
    window.history.pushState({ path: newUrl }, "", newUrl);
  };

  return (
    <div className="relative min-h-screen text-[#111111] flex flex-col justify-between overflow-x-hidden pb-32">
      {/* Interactive Neural Cluster background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <NeuralSynapseCanvas />
      </div>

      {/* Dynamic Grid Background Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none z-0" />

      {/* Elegant Header Brand Telemetry */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between border-b border-black/[0.03]">
        <div className="flex items-center gap-2">
          <span className="font-display font-medium text-sm tracking-wider">C O L E . D E V</span>
          <span className="px-1.5 py-0.5 bg-[#0070F3]/10 text-[#0070F3] font-mono text-[9px] rounded font-semibold">AI_ENGINEER</span>
        </div>

        {/* Real-time Telemetry HUD */}
        <div className="flex items-center gap-4 text-xs font-mono text-gray-500">
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span>NODE: EDGE_SERVER_ACTIVE</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 border-l border-black/10 pl-4">
            <Activity className="w-3.5 h-3.5 text-[#0070F3]" />
            <span>RTT: <span className="text-black font-semibold">{latency}</span></span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 border-l border-black/10 pl-4">
            <span>LOC: SF_CA</span>
          </div>
        </div>
      </header>

      {/* Primary Content Orchestrator */}
      <main className="relative z-10 max-w-7xl mx-auto w-full px-6 py-12 flex-grow">
        <AnimatePresence mode="wait">
          {currentView === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-16"
            >
              {/* Hero Presentation Section */}
              <div className="max-w-3xl space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-black/[0.06] rounded-full shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#0070F3]" />
                  <span className="font-mono text-[10px] text-gray-600 tracking-wider">MIND_MAPPED_PLATFORM_V1.0</span>
                </div>

                <h1 className="font-display font-medium text-4xl sm:text-5xl md:text-6xl tracking-tight leading-[1.08] text-gray-900">
                  Engineering Core <span className="text-[#0070F3]">Cognitive Architectures</span> & Distributed Systems.
                </h1>

                <p className="text-base sm:text-lg text-gray-600 leading-relaxed font-sans max-w-2xl">
                  Designing secure, edge-native systems, zero-latency inference loops, and high-fidelity technical stories representing how systems should think.
                </p>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button 
                    onClick={() => handleViewChange("assistant")}
                    className="group px-5 py-3 bg-[#111111] text-white hover:bg-black rounded-full font-medium text-sm flex items-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                  >
                    Consult Virtual Cole 
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                  <button 
                    onClick={() => handleViewChange("timeline")}
                    className="px-5 py-3 bg-white text-[#111111] border border-black/[0.08] hover:border-black/20 rounded-full font-medium text-sm transition-all duration-300 hover:bg-gray-50"
                  >
                    Trace Trajectory
                  </button>
                </div>
              </div>

              {/* Project Showcase Grid */}
              <ProjectShowcaseGrid 
                onProjectSelect={(slug) => {
                  setSelectedProjectSlug(slug);
                  const newUrl = `${window.location.pathname}?view=dashboard&project=${slug}`;
                  window.history.pushState({ path: newUrl }, "", newUrl);
                }}
              />
            </motion.div>
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
                onProjectSelect={(slug) => {
                  setSelectedProjectSlug(slug);
                  const newUrl = `${window.location.pathname}?view=dashboard&project=${slug}`;
                  window.history.pushState({ path: newUrl }, "", newUrl);
                }} 
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
                <span className="px-2.5 py-1 bg-[#0070F3]/10 text-[#0070F3] font-mono text-[9px] rounded font-semibold uppercase tracking-wider">Cognitive Mind</span>
                <h2 className="font-display font-medium text-3xl mt-3 tracking-tight">Virtual Cole Assistant</h2>
                <p className="text-gray-600 mt-2 text-sm leading-relaxed">
                  Interrogate Virtual Cole about system designs, relational D1 database schemas, trajectories, and strategic engineering decisions.
                </p>
              </div>

              <VirtualColeAssistant 
                onProjectSelect={(slug) => {
                  setSelectedProjectSlug(slug);
                  const newUrl = `${window.location.pathname}?view=dashboard&project=${slug}`;
                  window.history.pushState({ path: newUrl }, "", newUrl);
                }}
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
                <h2 className="font-display font-medium text-3xl mt-3 tracking-tight">Initiate System Handshake</h2>
                <p className="text-gray-600 mt-2 text-sm leading-relaxed">
                  Send a transactional message or schedule a direct calendar appointment with Cole.
                </p>
              </div>

              {/* High-Contrast Interactive Card Form */}
              <div className="bg-white border border-black/[0.06] rounded-2xl p-6 shadow-sm space-y-6">
                <form className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-gray-500 font-semibold uppercase">Sender Name</label>
                      <input 
                        type="text" 
                        placeholder="John Doe" 
                        className="w-full bg-black/[0.01] border border-black/[0.08] focus:border-[#0070F3] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs font-sans transition-all duration-200"
                        required 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-gray-500 font-semibold uppercase">Email Address</label>
                      <input 
                        type="email" 
                        placeholder="john@organization.com" 
                        className="w-full bg-black/[0.01] border border-black/[0.08] focus:border-[#0070F3] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs font-sans transition-all duration-200"
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-gray-500 font-semibold uppercase">Transmission Payload</label>
                    <textarea 
                      placeholder="Discussing low-latency edge synchronizers..." 
                      className="w-full min-h-[100px] bg-black/[0.01] border border-black/[0.08] focus:border-[#0070F3] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs font-sans transition-all duration-200 resize-none"
                      required
                    />
                  </div>

                  <button className="w-full bg-[#111111] hover:bg-black text-white py-3 rounded-xl text-xs font-mono font-medium transition-colors shadow-sm flex items-center justify-center gap-2">
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

export default function RootPage() {
  return (
    <Suspense fallback={<Loader />}>
      <PageContent />
    </Suspense>
  );
}
