"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  Image as ImageIcon, 
  Settings, 
  Search, 
  Plus, 
  Activity, 
  X, 
  Command,
  Database,
  ArrowRight,
  Terminal as TerminalIcon,
  RefreshCw,
  Sliders
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassPanel } from "../../src/shared/components/ui/glass-panel";

interface CommandOption {
  category: string;
  label: string;
  action: () => void;
  shortcut?: string;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dbStatus, setDbStatus] = useState("ONLINE");
  const [cacheFlushState, setCacheFlushState] = useState("idle"); // 'idle' | 'flushing' | 'flushed'
  
  // Navigation Links
  const navLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/content", label: "Content Manager", icon: FileText },
    { href: "/admin/media", label: "Media Library", icon: ImageIcon },
  ];

  // Key Down Listener for Command Palette (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
      
      // Escape key closes palette
      if (e.key === "Escape") {
        setIsCommandOpen(false);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Flush Global Cache Action
  const handleFlushCache = () => {
    setCacheFlushState("flushing");
    setTimeout(() => {
      setCacheFlushState("flushed");
      setTimeout(() => setCacheFlushState("idle"), 2000);
    }, 1200);
  };

  // Command Palette Options Catalog
  const commandOptions: CommandOption[] = [
    {
      category: "Content Management",
      label: "Create New Project",
      shortcut: "N",
      action: () => {
        setIsCommandOpen(false);
        router.push("/admin/editor?type=project");
      }
    },
    {
      category: "Content Management",
      label: "Create New Blog Article",
      shortcut: "A",
      action: () => {
        setIsCommandOpen(false);
        router.push("/admin/editor?type=article");
      }
    },
    {
      category: "Content Management",
      label: "Create New ADR / PRD",
      shortcut: "D",
      action: () => {
        setIsCommandOpen(false);
        router.push("/admin/editor?type=adr");
      }
    },
    {
      category: "Content Management",
      label: "Browse All Content",
      action: () => {
        setIsCommandOpen(false);
        router.push("/admin/content");
      }
    },
    {
      category: "Media Library",
      label: "Open Media Manager",
      action: () => {
        setIsCommandOpen(false);
        router.push("/admin/media");
      }
    },
    {
      category: "Platform Administration",
      label: "Purge Global Edge Cache (KV / ISR)",
      shortcut: "F",
      action: () => {
        handleFlushCache();
      }
    },
    {
      category: "System Coordinates",
      label: "Return to Public Cole.dev Portal",
      action: () => {
        setIsCommandOpen(false);
        router.push("/");
      }
    }
  ];

  // Filter options based on search query
  const filteredCommands = commandOptions.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cmd.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#E5E5E5] flex font-sans antialiased overflow-x-hidden selection:bg-gold/15 selection:text-white">
      {/* 1. LEFT SIDEBAR NAVIGATION */}
      <aside className="w-64 border-r border-neutral-800 bg-[#0E0E0E]/90 flex flex-col justify-between p-6 z-30">
        <div className="space-y-8">
          {/* Brand HUD logo */}
          <div className="flex items-center gap-3 border-b border-neutral-800 pb-5">
            <div className="w-7 h-7 rounded bg-gold/10 border border-gold/30 flex items-center justify-center">
              <Command className="w-4 h-4 text-gold" />
            </div>
            <div>
              <Link href="/" className="font-mono text-[10px] tracking-widest text-text-mute hover:text-gold block transition-colors">
                C O L E . D E V
              </Link>
              <span className="font-sans font-semibold text-xs text-foreground uppercase tracking-tight">KNOWLEDGE CMS</span>
            </div>
          </div>

          {/* Navigation link stacks */}
          <nav className="space-y-2.5">
            <span className="font-mono text-[8px] text-text-mute uppercase tracking-wider block mb-2 font-bold">Workspace Nodes</span>
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-medium text-xs font-medium transition-all ${
                    isActive
                      ? "bg-gold/10 text-white border border-gold/25 font-semibold"
                      : "text-text-mute hover:text-foreground hover:bg-neutral-900 border border-transparent"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-gold" : "text-text-mute"}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer telemetry */}
        <div className="space-y-4 pt-6 border-t border-neutral-800 font-mono text-[9px] text-text-mute">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1.5">
              <Database className="w-3 h-3 text-gold" />
              <span>DB_STATUS:</span>
            </span>
            <span className="text-emerald-500 font-bold uppercase">{dbStatus}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>CACHE_RATIO:</span>
            <span className="text-foreground font-semibold">94.2%</span>
          </div>
          <div className="flex justify-between items-center border-t border-neutral-800/50 pt-2 text-[8px] uppercase">
            <span>PLATFORM:</span>
            <span className="text-gold font-bold">Cloudflare Edge</span>
          </div>
        </div>
      </aside>

      {/* 2. MAIN APP VIEWPORT */}
      <div className="flex-grow flex flex-col min-h-screen relative">
        {/* Top Header telemetry bar */}
        <header className="h-16 border-b border-neutral-800 bg-[#0E0E0E]/50 px-8 flex items-center justify-between z-20 backdrop-blur-md">
          {/* Global search trigger */}
          <button 
            onClick={() => setIsCommandOpen(true)}
            className="flex items-center gap-3 px-4 py-2 bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800 rounded-medium text-xs text-text-mute w-80 text-left transition-all group"
          >
            <Search className="w-3.5 h-3.5 group-hover:text-gold transition-colors" />
            <span>Search or type command...</span>
            <span className="ml-auto font-mono text-[9px] bg-neutral-800 px-1.5 py-0.5 rounded text-text-tech border border-neutral-700/50">
              ⌘K
            </span>
          </button>

          {/* Quick status bar */}
          <div className="flex items-center gap-5 text-xs font-mono text-text-mute">
            <button
              onClick={handleFlushCache}
              disabled={cacheFlushState === "flushing"}
              className="flex items-center gap-2 hover:text-gold transition-colors font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${cacheFlushState === "flushing" ? "animate-spin text-gold" : ""}`} />
              <span>
                {cacheFlushState === "idle" && "FLUSH_EDGE_CACHE"}
                {cacheFlushState === "flushing" && "FLUSHING_ISOLATES..."}
                {cacheFlushState === "flushed" && "CACHE_INVALIDATED"}
              </span>
            </button>
            <span className="text-neutral-700">|</span>
            <Link href="/" className="hover:text-foreground flex items-center gap-1 font-semibold">
              <span>VIEW_PUBLIC_SITE</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </header>

        {/* Dynamic page content */}
        <main className="flex-grow p-8 bg-[#0B0B0B] relative overflow-y-auto">
          {children}
        </main>
      </div>

      {/* 3. COMMAND PALETTE OVERLAY */}
      <AnimatePresence>
        {isCommandOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#000000]/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setIsCommandOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-2xl overflow-hidden rounded-xlarge border border-neutral-800 bg-[#0F0F0F] shadow-premium-2 flex flex-col max-h-[500px]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search Box */}
              <div className="relative p-5 border-b border-neutral-800 flex items-center gap-3.5 bg-neutral-900/30">
                <Search className="w-5 h-5 text-gold flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type a command or filter tools..."
                  className="w-full bg-transparent border-0 focus:outline-none text-sm text-foreground placeholder:text-text-mute font-sans"
                  autoFocus
                />
                <button 
                  onClick={() => setIsCommandOpen(false)}
                  className="p-1 hover:bg-neutral-800 rounded border border-neutral-800 hover:text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Options List */}
              <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {filteredCommands.length > 0 ? (
                  // Group options by category
                  Object.entries(
                    filteredCommands.reduce((groups, cmd) => {
                      if (!groups[cmd.category]) groups[cmd.category] = [];
                      groups[cmd.category].push(cmd);
                      return groups;
                    }, {} as Record<string, CommandOption[]>)
                  ).map(([category, items]) => (
                    <div key={category} className="space-y-1.5">
                      <span className="font-mono text-[8px] text-text-mute uppercase tracking-widest block font-bold px-3">
                        {category}
                      </span>
                      <div className="space-y-0.5">
                        {items.map((cmd) => (
                          <button
                            key={cmd.label}
                            onClick={cmd.action}
                            className="w-full flex items-center justify-between px-3 py-3 rounded-medium hover:bg-gold/10 border border-transparent hover:border-gold/25 text-left transition-all group cursor-pointer"
                          >
                            <span className="text-xs font-medium text-text-mute group-hover:text-white transition-colors">
                              {cmd.label}
                            </span>
                            {cmd.shortcut && (
                              <span className="font-mono text-[9px] bg-neutral-800 border border-neutral-700 px-1.5 py-0.5 rounded text-text-tech group-hover:bg-gold/20 group-hover:border-gold/30 transition-colors">
                                {cmd.shortcut}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 font-mono text-[9.5px] text-text-mute uppercase tracking-wide">
                    No matching commands found.
                  </div>
                )}
              </div>

              {/* Footer status bar */}
              <div className="p-3 bg-neutral-950/60 border-t border-neutral-800 flex items-center justify-between font-mono text-[8.5px] text-text-mute select-none px-5">
                <span>Use arrows keys to navigate</span>
                <span>ESC TO CLOSE</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
