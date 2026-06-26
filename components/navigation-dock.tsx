"use client";

import { motion } from "motion/react";
import { Layers, BookOpen, CalendarDays, Brain, Mail } from "lucide-react";

export const navigationViews = ["dashboard", "notebook", "timeline", "assistant", "contact"] as const;

export type NavigationView = (typeof navigationViews)[number];

interface NavigationDockProps {
  currentView: NavigationView;
  onViewChange: (view: NavigationView) => void;
}

export default function NavigationDock({
  currentView,
  onViewChange,
}: NavigationDockProps) {
  const items: Array<{ id: NavigationView; label: string; icon: typeof Layers; description: string }> = [
    {
      id: "dashboard",
      label: "Systems",
      icon: Layers,
      description: "Architecture grid",
    },
    {
      id: "notebook",
      label: "Intellect",
      icon: BookOpen,
      description: "Long-form writing",
    },
    {
      id: "timeline",
      label: "Chronology",
      icon: CalendarDays,
      description: "Milestones log",
    },
    {
      id: "assistant",
      label: "Virtual Cole",
      icon: Brain,
      description: "Cognitive AI Console",
    },
    {
      id: "contact",
      label: "Contact",
      icon: Mail,
      description: "Direct ink",
    },
  ];

  return (
    <div
      id="global-navigation-dock"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
    >
      <div className="flex items-center gap-1.5 px-3 py-2.5 bg-white/80 dark:bg-[#111111]/80 backdrop-blur-xl rounded-full border border-black/[0.06] shadow-lg pointer-events-auto transition-shadow duration-300 hover:shadow-xl">
        {items.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => onViewChange(item.id)}
              className="relative group p-3 rounded-full flex items-center justify-center transition-all duration-300 text-slate-gray hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue"
              title={`${item.label} — ${item.description}`}
            >
              {/* Spring background indicator */}
              {isActive && (
                <motion.div
                  layoutId="active-indicator"
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 30,
                  }}
                  className="absolute inset-0 bg-[#0070F3]/10 dark:bg-accent-blue/20 rounded-full"
                />
              )}

              {/* Icon */}
              <Icon
                className={`w-5 h-5 relative z-10 transition-transform duration-300 group-hover:scale-110 ${
                  isActive ? "text-[#0070F3]" : "text-gray-500 hover:text-gray-900"
                }`}
              />

              {/* Tooltip */}
              <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 pointer-events-none z-50">
                <div className="bg-[#111111] text-white text-xs px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-md border border-white/10 flex flex-col items-center">
                  <span className="font-medium font-display">{item.label}</span>
                  <span className="text-[10px] text-gray-400 font-mono mt-0.5">{item.description}</span>
                </div>
                {/* Tooltip triangle */}
                <div className="w-2 h-2 bg-[#111111] rotate-45 absolute top-full -mt-1 left-1/2 -translate-x-1/2 border-r border-b border-white/10" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
