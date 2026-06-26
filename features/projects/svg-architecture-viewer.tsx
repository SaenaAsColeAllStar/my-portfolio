"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Laptop, 
  Cpu, 
  Database, 
  Layers, 
  Brain, 
  Workflow,
} from "lucide-react";
import { getProjectArchitecture, type ArchitectureNode } from "@/features/projects/domain/project-catalog";

interface SVGArchitectureViewerProps {
  projectSlug: string;
}

const iconMap = {
  client: Laptop,
  gateway: Workflow,
  cache: Layers,
  model: Brain,
  db: Database,
  edge: Cpu,
};

export default function SVGArchitectureViewer({ projectSlug }: SVGArchitectureViewerProps) {
  const [hoveredNode, setHoveredNode] = useState<ArchitectureNode | null>(null);
  const [activeNode, setActiveNode] = useState<ArchitectureNode | null>(null);

  const data = getProjectArchitecture(projectSlug);
  const { nodes, links } = data;

  const getIcon = (type: ArchitectureNode["type"]) => {
    return iconMap[type] || Cpu;
  };

  return (
    <div id="svg-architecture-viewer-container" className="relative w-full h-full min-h-[400px] flex flex-col justify-between bg-black/5 dark:bg-white/[0.01] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] overflow-hidden p-6 select-none">
      
      {/* Background Subtle Tech Layout Details */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none" />
      
      {/* Topology Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-black/[0.04] dark:border-white/[0.04] pb-3">
        <div className="flex items-center gap-2">
          <Workflow className="w-4 h-4 text-[#0070F3]" />
          <span className="font-mono text-xs font-semibold tracking-wider uppercase text-gray-500">System Topology Map</span>
        </div>
        <div className="font-mono text-[9px] text-gray-400">
          STATUS: <span className="text-green-500 animate-pulse font-bold">ACTIVE_TELEMETRY</span>
        </div>
      </div>

      {/* Primary SVG Playground */}
      <div className="relative w-full flex-grow flex items-center justify-center py-6">
        <svg 
          viewBox="0 0 600 450" 
          className="w-full h-full max-h-[380px]"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Definitions for elegant gradients and effects */}
          <defs>
            <linearGradient id="sapphireGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0070F3" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0F52BA" stopOpacity="0.3" />
            </linearGradient>
            <radialGradient id="nodeRing" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0070F3" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#0070F3" stopOpacity="0" />
            </radialGradient>
            <filter id="svgGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Links / Synaptic Lines */}
          {links.map((link, idx) => {
            const sourceNode = nodes.find(n => n.id === link.source);
            const targetNode = nodes.find(n => n.id === link.target);

            if (!sourceNode || !targetNode) return null;

            const isRelatedToHovered = hoveredNode && (hoveredNode.id === link.source || hoveredNode.id === link.target);
            const isRelatedToActive = activeNode && (activeNode.id === link.source || activeNode.id === link.target);

            return (
              <g key={`link-${idx}`}>
                {/* Thick background glow on connection focus */}
                <motion.line
                  x1={sourceNode.x}
                  y1={sourceNode.y}
                  x2={targetNode.x}
                  y2={targetNode.y}
                  stroke="#0070F3"
                  strokeWidth={isRelatedToActive || isRelatedToHovered ? 4 : 0}
                  opacity={isRelatedToActive ? 0.25 : isRelatedToHovered ? 0.15 : 0}
                  className="transition-all duration-300"
                />
                
                {/* Standard network cable */}
                <line
                  x1={sourceNode.x}
                  y1={sourceNode.y}
                  x2={targetNode.x}
                  y2={targetNode.y}
                  stroke={isRelatedToActive || isRelatedToHovered ? "#0070F3" : "#D1D5DB"}
                  strokeWidth={isRelatedToActive || isRelatedToHovered ? 1.5 : 1}
                  strokeDasharray={isRelatedToActive || isRelatedToHovered ? "none" : "3 3"}
                  opacity={isRelatedToActive || isRelatedToHovered ? 0.9 : 0.4}
                  className="transition-all duration-300 dark:stroke-gray-700"
                />

                {/* Pulsing signal packet flowing along the path */}
                <motion.circle
                  r="3"
                  fill="#0070F3"
                  filter="url(#svgGlow)"
                  initial={{ offset: 0 }}
                  animate={{
                    cx: [sourceNode.x, targetNode.x],
                    cy: [sourceNode.y, targetNode.y]
                  }}
                  transition={{
                    duration: 3 + idx * 0.5,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const isHovered = hoveredNode?.id === node.id;
            const isActive = activeNode?.id === node.id;
            const Icon = getIcon(node.type);

            return (
              <g 
                key={node.id}
                id={`node-group-${node.id}`}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => setActiveNode(isActive ? null : node)}
              >
                {/* Microscopic radial pulse expansion (Sapphire blue glow) */}
                <AnimatePresence>
                  {(isHovered || isActive) && (
                    <motion.circle
                      cx={node.x}
                      cy={node.y}
                      r="28"
                      fill="url(#nodeRing)"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 1.2, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </AnimatePresence>

                {/* Node Outer Circle boundary */}
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r="18"
                  fill={isActive ? "#0070F3" : isHovered ? "rgba(0,112,243,0.15)" : "#FFFFFF"}
                  stroke={isActive ? "#0070F3" : isHovered ? "#0070F3" : "#E2E8F0"}
                  strokeWidth="1.5"
                  className="transition-colors duration-200 shadow-sm dark:fill-[#111111] dark:stroke-gray-800"
                  whileHover={{ scale: 1.12 }}
                />

                {/* Node Core Icon Embed */}
                <g transform={`translate(${node.x - 8}, ${node.y - 8})`}>
                  <Icon 
                    className={`w-4 h-4 ${
                      isActive 
                        ? "text-white" 
                        : isHovered 
                          ? "text-[#0070F3]" 
                          : "text-gray-500 dark:text-gray-400"
                    }`} 
                  />
                </g>

                {/* Node Labels */}
                <text
                  x={node.x}
                  y={node.y + 32}
                  textAnchor="middle"
                  className="font-display text-[9px] font-medium tracking-tight fill-gray-900 dark:fill-white select-none"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Real-time details HUD floating in SVG corner */}
        <AnimatePresence mode="wait">
          {(hoveredNode || activeNode) ? (
            <motion.div
              key={(hoveredNode || activeNode)?.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.18 }}
              className="absolute bottom-2 left-2 right-2 md:left-6 md:right-6 bg-white/95 dark:bg-[#151515]/95 backdrop-blur-md rounded-xl p-4 border border-black/[0.06] dark:border-white/[0.06] shadow-lg flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-1.5 py-0.5 bg-[#0070F3]/10 text-[#0070F3] font-mono text-[8px] rounded uppercase font-bold tracking-wider">
                    {(hoveredNode || activeNode)?.type}
                  </span>
                  <h4 className="font-display font-medium text-xs mt-1 text-gray-900 dark:text-white">
                    {(hoveredNode || activeNode)?.label}
                  </h4>
                </div>
                <div className="text-right">
                  <span className="font-mono text-[9px] text-gray-400 block">LATENCY NODE</span>
                  <span className="font-mono text-xs text-green-500 font-bold">{(hoveredNode || activeNode)?.latency}</span>
                </div>
              </div>
              
              <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-normal mt-2">
                {(hoveredNode || activeNode)?.details}
              </p>

              <div className="mt-3 pt-2.5 border-t border-black/[0.03] dark:border-white/[0.03] flex items-center justify-between text-[9px] font-mono text-gray-500">
                <span>STACK: <span className="text-black dark:text-white font-semibold">{(hoveredNode || activeNode)?.tech}</span></span>
                <span className="text-gray-400">Click node to lock telemetry overlay</span>
              </div>
            </motion.div>
          ) : (
            <div className="absolute bottom-2 left-2 right-2 md:left-6 md:right-6 text-center text-[10px] font-mono text-gray-400 bg-black/[0.01] border border-dashed border-black/[0.06] rounded-xl p-4">
              Hover over node to trace packet latency profiles & telemetry
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Topology Legend Footer */}
      <div className="border-t border-black/[0.03] dark:border-white/[0.03] pt-3 flex flex-wrap gap-x-4 gap-y-1 justify-center text-[9px] font-mono text-gray-400">
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span>Client Browser</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
          <span>Edge Compute</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span>Key-Value Cache</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          <span>Cognitive / Database Layer</span>
        </div>
      </div>
    </div>
  );
}
