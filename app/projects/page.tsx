"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Activity, 
  Sparkles, 
  Cpu, 
  Network, 
  Shield, 
  ArrowRight, 
  ArrowUpDown,
  HelpCircle
} from "lucide-react";
import Link from "next/link";

// Import platform layer and design primitives using relative paths
import { cmsClient, type Project } from "../../src/shared/lib/cms/cms-client";
import { Card } from "../../src/shared/components/ui/card";
import { GlassPanel } from "../../src/shared/components/ui/glass-panel";
import { Grid } from "../../src/shared/components/ui/grid";
import { Button } from "../../src/shared/components/ui/button";

const iconMap = {
  cpu: Cpu,
  network: Network,
  shield: Shield,
};

export default function ProjectsIndexPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sortBy, setSortBy] = useState<"title" | "latency" | "difficulty">("title");
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null);

  // Load projects from edge-native CMS platform layer
  useEffect(() => {
    cmsClient.getProjects().then(setProjects);
  }, []);

  // Filter & Sort Logic
  const categories = ["All", ...Array.from(new Set(projects.map((p) => p.category)))];
  const difficulties = ["All", "Advanced", "Expert"];
  const statuses = ["All", "Production", "Beta"];

  const filteredProjects = projects
    .filter((p) => {
      const matchesSearch = 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === "All" || p.difficulty === selectedDifficulty;
      const matchesStatus = selectedStatus === "All" || p.status === selectedStatus;
      
      return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === "latency") {
        const getMs = (metric: string) => parseFloat(metric) || 9999;
        return getMs(a.latencyMetric) - getMs(b.latencyMetric);
      }
      if (sortBy === "difficulty") {
        return a.difficulty.localeCompare(b.difficulty);
      }
      return 0;
    });

  return (
    <div className="relative min-h-screen text-[#111111] dark:text-[#FFFFFF] flex flex-col justify-between overflow-x-hidden pb-32">
      {/* Background Dotted Blueprint Grid */}
      <div className="absolute inset-0 blueprint-grid-canvas pointer-events-none z-0 opacity-45" />

      {/* Header telemetry and brand */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between border-b border-border-mute bg-background/20 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <Link href="/" className="font-sans font-medium text-sm tracking-wider hover:text-gold transition-colors">
            C O L E . D E V
          </Link>
          <span className="text-gray-300 dark:text-neutral-700 font-sans text-xs">/</span>
          <span className="px-1.5 py-0.5 bg-border-mute text-text-mute font-mono text-[9px] rounded font-bold uppercase">
            INDEX / PROJECTS
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-text-mute">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>PORTFOLIO_DATABASE_ONLINE</span>
        </div>
      </header>

      {/* Primary Grid Workspace */}
      <main className="relative z-10 max-w-7xl mx-auto w-full px-6 py-12 flex-grow space-y-12">
        
        {/* Page Titles */}
        <section className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-surface border border-border-mute rounded-full shadow-premium-1">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span className="font-mono text-[10px] text-text-mute tracking-wider uppercase">System Journal Index v2.0</span>
          </div>
          <h1 className="text-hero text-foreground font-medium tracking-tight">
            The <span className="text-gold">Engineering Journals</span>.
          </h1>
          <p className="text-editorial-body text-text-mute leading-relaxed">
            Exhaustive, dynamic case studies explaining the architecture, system design, trade-offs, and failure recoveries behind every production deployment.
          </p>
        </section>

        {/* Dynamic Filter and Search HUD */}
        <section className="bg-surface border border-border-strong rounded-xlarge p-6 shadow-premium-2 space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input Box */}
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-mute" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by system title, tag, or stack component..."
                className="w-full bg-background border border-border-strong focus:border-gold focus:outline-none rounded-medium pl-10 pr-4 py-3 text-xs font-sans transition-colors duration-200 text-foreground"
              />
            </div>

            {/* Sorting Toggles */}
            <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto scrollbar-none pb-1 md:pb-0">
              <div className="flex items-center gap-1.5 font-mono text-[9px] text-text-mute uppercase font-bold tracking-wider">
                <ArrowUpDown className="w-3.5 h-3.5 text-gold" />
                <span>Sort by:</span>
              </div>
              <div className="flex bg-background border border-border-strong rounded-medium p-0.5">
                {[
                  { id: "title", label: "Title" },
                  { id: "latency", label: "Latency" },
                  { id: "difficulty", label: "Difficulty" },
                ].map((sortOption) => (
                  <button
                    key={sortOption.id}
                    onClick={() => setSortBy(sortOption.id as any)}
                    className={`px-3 py-1.5 rounded-medium font-mono text-[9px] uppercase transition-all duration-200 cursor-pointer ${
                      sortBy === sortOption.id
                        ? "bg-surface-alt text-foreground font-semibold border border-border-strong"
                        : "text-text-mute hover:text-foreground"
                    }`}
                  >
                    {sortOption.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tag and Category filters */}
          <div className="border-t border-border-mute pt-6 flex flex-wrap gap-6 text-xs">
            {/* Category Cluster */}
            <div className="space-y-2">
              <div className="font-mono text-[9px] text-text-tech uppercase font-bold tracking-wider">Category Core:</div>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded border text-[10px] font-mono transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-gold/10 border-gold text-foreground font-medium"
                        : "bg-background border-border-strong hover:border-text-mute text-text-mute"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty HUD */}
            <div className="space-y-2">
              <div className="font-mono text-[9px] text-text-tech uppercase font-bold tracking-wider">Difficulty Guard:</div>
              <div className="flex flex-wrap gap-2">
                {difficulties.map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`px-3 py-1.5 rounded border text-[10px] font-mono transition-all cursor-pointer ${
                      selectedDifficulty === diff
                        ? "bg-gold/10 border-gold text-foreground font-medium"
                        : "bg-background border-border-strong hover:border-text-mute text-text-mute"
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <div className="font-mono text-[9px] text-text-tech uppercase font-bold tracking-wider">Deployment Status:</div>
              <div className="flex flex-wrap gap-2">
                {statuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-3 py-1.5 rounded border text-[10px] font-mono transition-all cursor-pointer ${
                      selectedStatus === status
                        ? "bg-gold/10 border-gold text-foreground font-medium"
                        : "bg-background border-border-strong hover:border-text-mute text-text-mute"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Projects Result Catalog */}
        <section className="space-y-6">
          <div className="flex justify-between items-center px-1">
            <span className="font-mono text-[9px] text-text-tech uppercase tracking-wider font-bold">
              Found {filteredProjects.length} System Blueprints
            </span>
            <span className="font-mono text-[9px] text-text-mute uppercase">Filtered list v2.1</span>
          </div>

          {filteredProjects.length > 0 ? (
            <Grid columns={12} className="gap-6">
              {filteredProjects.map((project) => {
                const ProjectIcon = iconMap[project.iconKey as keyof typeof iconMap] || Cpu;
                
                return (
                  <div 
                    key={project.id} 
                    className="col-span-12 md:col-span-4"
                    onMouseEnter={() => setHoveredProjectId(project.id)}
                    onMouseLeave={() => setHoveredProjectId(null)}
                  >
                    <Link href={`/projects/${project.slug}`} className="block h-full group focus:outline-none">
                      <Card
                        glowEffect={true}
                        interactive={true}
                        className="p-6 min-h-[300px] flex flex-col justify-between h-full border-border-strong transition-all duration-300 group-hover:border-gold/30"
                      >
                        <div className="space-y-4">
                          {/* Metadata row */}
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 bg-surface-alt border border-border-mute text-[9px] font-mono text-foreground font-bold rounded uppercase">
                              {project.category}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${project.status === "Production" ? "bg-emerald-500" : "bg-blue-500"} animate-pulse`} />
                              <span className="text-[9px] font-mono text-text-tech uppercase">{project.status}</span>
                            </div>
                          </div>

                          {/* Title and descriptions */}
                          <h3 className="text-heading-technical text-foreground group-hover:text-gold transition-colors duration-200">
                            {project.title}
                          </h3>
                          <p className="text-xs text-text-mute leading-relaxed line-clamp-3">
                            {project.description}
                          </p>
                          
                          {/* Tech stack pills */}
                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {project.tags.slice(0, 3).map((tag: string) => (
                              <span key={tag} className="px-2 py-0.5 bg-surface-alt border border-border-mute text-[8px] font-mono text-text-tech rounded">
                                {tag}
                              </span>
                            ))}
                            {project.tags.length > 3 && (
                              <span className="text-[8px] font-mono text-text-mute px-1.5">
                                +{project.tags.length - 3}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Telemetry Footer HUD */}
                        <div className="border-t border-border-mute pt-4 mt-6 flex flex-col gap-2.5 text-[9px] font-mono text-text-tech">
                          <div className="flex justify-between">
                            <span>LATENCY: <span className="text-foreground font-semibold">{project.latencyMetric}</span></span>
                            <span>SCALE: <span className="text-foreground font-semibold">{project.scaleMetric}</span></span>
                          </div>
                          <div className="flex justify-between items-center border-t border-border-mute/50 pt-2.5">
                            <span>DIFFICULTY: <span className="text-gold uppercase font-bold">{project.difficulty}</span></span>
                            <span className="text-gold group-hover:underline flex items-center gap-1">
                              <span>ANALYZE_JOURNAL</span>
                              <ArrowRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                            </span>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </div>
                );
              })}
            </Grid>
          ) : (
            <div className="text-center space-y-4 p-12 border border-dashed border-border-strong bg-surface/20 rounded-xlarge">
              <HelpCircle className="w-8 h-8 text-gold/60 mx-auto animate-bounce" />
              <div className="space-y-1">
                <h3 className="font-sans font-medium text-sm text-foreground">No Blueprint Matches Found</h3>
                <p className="font-mono text-[9px] text-text-tech uppercase">Reset search filters or adjust tags to examine alternative systems routing.</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setSelectedDifficulty("All");
                  setSelectedStatus("All");
                }}
              >
                Reset Filters
              </Button>
            </div>
          )}
        </section>
      </main>

      {/* Floating Dock navigates back home */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <GlassPanel className="px-6 py-3 border-border-strong rounded-full shadow-premium-2 flex items-center gap-4" intensity="high">
          <Link href="/" className="group flex items-center gap-2 font-mono text-[10px] text-text-mute hover:text-foreground transition-colors">
            <ArrowRight className="w-3.5 h-3.5 rotate-180 transition-transform duration-200 group-hover:-translate-x-0.5" />
            <span>RETURN_TO_CORE_DASHBOARD</span>
          </Link>
        </GlassPanel>
      </div>
    </div>
  );
}
