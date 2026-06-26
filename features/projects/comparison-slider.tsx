"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, ArrowLeftRight, HelpCircle } from "lucide-react";

export interface ComparisonSliderProps {
  beforeTitle?: string;
  afterTitle?: string;
  beforeLabel?: string;
  afterLabel?: string;
  beforeContent?: React.ReactNode;
  afterContent?: React.ReactNode;
  className?: string;
}

/**
 * Premium Interactive Before/After Architectural Comparison Slider.
 * Fully responsive, touch-enabled, and keyboard-navigable.
 */
export const ComparisonSlider: React.FC<ComparisonSliderProps> = ({
  beforeTitle = "BEFORE: CENTRALIZED_SYSTEM",
  afterTitle = "AFTER: EDGE_NATIVE_PIPELINE",
  beforeLabel = "High Latency & Lockout Risk",
  afterLabel = "Sub-15ms Consolidated Edge Flow",
  beforeContent,
  afterContent,
  className = "",
}) => {
  const [sliderPosition, setSliderPosition] = useState(50); // 0 to 100 %
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging]);

  // Keyboard navigation for accessibility (WCAG AA/AAA)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setSliderPosition((prev) => Math.max(0, prev - 5));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setSliderPosition((prev) => Math.min(100, prev + 5));
    }
  };

  // Default Mock Contents representing Database/Latency Improvements if no custom content is passed
  const defaultBefore = (
    <div className="w-full h-full bg-red-500/5 border border-red-500/10 rounded-xl p-6 flex flex-col justify-between font-mono text-xs text-red-600 select-none">
      <div className="space-y-3">
        <div className="flex items-center gap-2 border-b border-red-500/15 pb-2">
          <Activity className="w-4 h-4 animate-pulse" />
          <span>LATENCY OVERHEAD: 1,620ms p95</span>
        </div>
        <div className="space-y-1.5 font-sans text-text-mute">
          <p>⚠️ Central region routing database lockouts.</p>
          <p>⚠️ 14.2% failed writes under concurrent traffic spikes.</p>
          <p>⚠️ Thread blocking due to heavy regex de-serialization.</p>
        </div>
      </div>
      
      <div className="h-16 w-full flex items-end gap-1 border-b border-red-500/10 pb-1">
        {[80, 95, 70, 85, 90, 100, 75, 98, 88, 92].map((val, idx) => (
          <div 
            key={idx} 
            className="flex-grow bg-red-400/25 border-t border-red-500/50" 
            style={{ height: `${val}%` }} 
          />
        ))}
      </div>
      <span className="text-[9px] text-red-500 text-center uppercase tracking-wider">DATABASE CONGESTION CRITICAL</span>
    </div>
  );

  const defaultAfter = (
    <div className="w-full h-full bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-6 flex flex-col justify-between font-mono text-xs text-emerald-600 select-none">
      <div className="space-y-3">
        <div className="flex items-center gap-2 border-b border-emerald-500/15 pb-2">
          <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
          <span>LATENCY OVERHEAD: 12ms p95</span>
        </div>
        <div className="space-y-1.5 font-sans text-text-mute">
          <p>✅ Consolidated edge write batching namespaces.</p>
          <p>✅ 0.00% failed writes under 1.2M concurrent loads.</p>
          <p>✅ Compiled Rust WASM payload screening filters.</p>
        </div>
      </div>

      <div className="h-16 w-full flex items-end gap-1 border-b border-emerald-500/10 pb-1">
        {[2, 3, 1, 2, 4, 3, 2, 1, 3, 2].map((val, idx) => (
          <div 
            key={idx} 
            className="flex-grow bg-emerald-500/25 border-t border-emerald-500/50" 
            style={{ height: `${val * 10}%` }} 
          />
        ))}
      </div>
      <span className="text-[9px] text-emerald-500 text-center uppercase tracking-wider">EDGE HEALTH: OPTIMAL (RTT = 12ms)</span>
    </div>
  );

  return (
    <div className={`relative flex flex-col gap-3 ${className}`}>
      {/* Title Header */}
      <div className="flex justify-between font-mono text-[9px] text-text-tech uppercase font-bold tracking-wider px-1">
        <span className="text-red-500">{beforeTitle}</span>
        <span className="text-emerald-500">{afterTitle}</span>
      </div>

      {/* Main Interactive Slider container */}
      <div
        ref={containerRef}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="slider"
        aria-label="Before and after architecture comparison"
        aria-valuenow={sliderPosition}
        aria-valuemin={0}
        aria-valuemax={100}
        className="relative w-full h-[280px] border border-border-strong rounded-large overflow-hidden select-none bg-surface/30 focus:outline-none focus:ring-1 focus:ring-gold/30"
      >
        {/* AFTER state panel (Base layer) */}
        <div className="absolute inset-0 w-full h-full p-4">
          {afterContent || defaultAfter}
          {/* Label badge */}
          <div className="absolute bottom-6 right-6 px-2.5 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-mono text-[8.5px] rounded uppercase font-semibold">
            {afterLabel}
          </div>
        </div>

        {/* BEFORE state panel (Clipping layer) */}
        <div
          className="absolute inset-0 h-full overflow-hidden p-4 bg-background dark:bg-[#0A0A0A]"
          style={{ width: `${sliderPosition}%` }}
        >
          {/* Constrain inner width so content doesn't scale as the slider moves */}
          <div 
            className="absolute inset-0 p-4"
            style={{ width: containerRef.current?.getBoundingClientRect().width }}
          >
            {beforeContent || defaultBefore}
          </div>
          {/* Label badge */}
          <div className="absolute bottom-6 left-6 px-2.5 py-1 bg-red-500/10 text-red-500 border border-red-500/20 font-mono text-[8.5px] rounded uppercase font-semibold whitespace-nowrap">
            {beforeLabel}
          </div>
        </div>

        {/* Divider Drag handle */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-gold cursor-ew-resize z-30 flex items-center justify-center group"
          style={{ left: `${sliderPosition}%` }}
          onMouseDown={() => setIsDragging(true)}
          onTouchStart={() => setIsDragging(true)}
        >
          <div className="absolute w-7 h-7 bg-white dark:bg-[#111111] border border-gold rounded-full flex items-center justify-center shadow-premium-2 cursor-ew-resize transition-all duration-150 group-hover:scale-110">
            <ArrowLeftRight className="w-3.5 h-3.5 text-gold" />
          </div>
        </div>
      </div>

      {/* Instruction Caption */}
      <div className="flex justify-between items-center text-[9.5px] font-mono text-text-mute px-1">
        <span className="flex items-center gap-1">
          <HelpCircle className="w-3 h-3 text-gold" />
          <span>Drag bar or use Left/Right arrow keys to compare</span>
        </span>
        <span>SLIDER_OFFSET: {Math.round(sliderPosition)}%</span>
      </div>
    </div>
  );
};

export default ComparisonSlider;
