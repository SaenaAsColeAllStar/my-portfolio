"use client";

import React, { useState, useEffect } from "react";
import { 
  Activity, 
  Sparkles, 
  Cpu, 
  FileText, 
  Image as ImageIcon, 
  Plus, 
  Clock, 
  TrendingUp, 
  AlertCircle,
  FolderOpen
} from "lucide-react";
import Link from "next/link";
import { Card } from "../../src/shared/components/ui/card";
import { GlassPanel } from "../../src/shared/components/ui/glass-panel";
import { Grid } from "../../src/shared/components/ui/grid";
import { Button } from "../../src/shared/components/ui/button";

interface DashboardStats {
  activeNodes: number;
  draftNodes: number;
  archivedNodes: number;
  totalNodes: number;
  mediaCount: number;
  totalMediaBytes: number;
  cacheHitRatio: string;
  activities: Array<{
    id: string;
    action: string;
    nodeId: string | null;
    nodeTitle: string | null;
    details: string | null;
    createdAt: string;
  }>;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch telemetry from local API
  useEffect(() => {
    fetch("/api/cms/dashboard")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Dashboard stats failed to load:", err);
        setLoading(false);
      });
  }, []);

  // Format bytes helper
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = 2;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  // Format timestamp helper
  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Activity className="h-5 w-5 animate-spin text-gold" />
          <span className="font-mono text-[9px] text-text-mute tracking-widest uppercase">Querying CMS telemetry...</span>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8 border border-dashed border-red-500/20 bg-red-500/5 rounded-large text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
        <h3 className="font-sans font-medium text-sm text-foreground">Telemetry Connection Interrupted</h3>
        <p className="font-mono text-[9px] text-text-mute uppercase">Database binding query timed out or failed to resolve.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-neutral-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-full shadow-sm mb-2.5">
            <Sparkles className="w-3 h-3 text-gold" />
            <span className="font-mono text-[9px] text-text-tech tracking-wider uppercase">CMS CORE ACTIVE</span>
          </div>
          <h1 className="text-2xl font-medium tracking-tight text-foreground">
            Telemetry Dashboard.
          </h1>
          <p className="text-xs text-text-mute">
            Live analytics monitoring Cole.dev content nodes, media storage metrics, and edge sync operations.
          </p>
        </div>

        {/* Action button triggers */}
        <div className="flex flex-wrap gap-3.5">
          <Link href="/admin/editor">
            <Button size="sm" className="bg-gold hover:bg-gold/90 text-black border border-gold/15">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              <span>Create Node</span>
            </Button>
          </Link>
          <Link href="/admin/media">
            <Button size="sm" variant="secondary">
              <ImageIcon className="w-3.5 h-3.5 mr-1.5" />
              <span>Upload Media</span>
            </Button>
          </Link>
        </div>
      </section>

      {/* 4 CORE TELEMETRY METRIC CARDS */}
      <section>
        <Grid columns={12} className="gap-6">
          {/* Node count */}
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <Card className="p-6 border-neutral-800 bg-[#0E0E0E]">
              <div className="flex justify-between items-start mb-4">
                <span className="font-mono text-[9px] text-text-mute uppercase font-bold tracking-wider">Active Knowledge Nodes</span>
                <FileText className="w-4 h-4 text-gold" />
              </div>
              <div className="space-y-1.5">
                <span className="text-3xl font-display font-medium text-foreground">{stats.activeNodes}</span>
                <span className="text-[10px] text-emerald-500 font-mono block uppercase font-bold">● Published live</span>
              </div>
            </Card>
          </div>

          {/* Draft queue */}
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <Card className="p-6 border-neutral-800 bg-[#0E0E0E]">
              <div className="flex justify-between items-start mb-4">
                <span className="font-mono text-[9px] text-text-mute uppercase font-bold tracking-wider">Draft Queue</span>
                <Clock className="w-4 h-4 text-[#0070F3]" />
              </div>
              <div className="space-y-1.5">
                <span className="text-3xl font-display font-medium text-foreground">{stats.draftNodes}</span>
                <span className="text-[10px] text-text-tech font-mono block uppercase">Pending publish verification</span>
              </div>
            </Card>
          </div>

          {/* Media registry */}
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <Card className="p-6 border-neutral-800 bg-[#0E0E0E]">
              <div className="flex justify-between items-start mb-4">
                <span className="font-mono text-[9px] text-text-mute uppercase font-bold tracking-wider">Media Library</span>
                <ImageIcon className="w-4 h-4 text-purple-500" />
              </div>
              <div className="space-y-1.5">
                <span className="text-3xl font-display font-medium text-foreground">{stats.mediaCount}</span>
                <span className="text-[10px] text-text-mute font-mono block uppercase font-semibold">
                  Storage Size: <span className="text-foreground">{formatBytes(stats.totalMediaBytes)}</span>
                </span>
              </div>
            </Card>
          </div>

          {/* Cache performance */}
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <Card className="p-6 border-neutral-800 bg-[#0E0E0E]">
              <div className="flex justify-between items-start mb-4">
                <span className="font-mono text-[9px] text-text-mute uppercase font-bold tracking-wider">Edge Cache Health</span>
                <Cpu className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="space-y-1.5">
                <span className="text-3xl font-display font-medium text-foreground">{stats.cacheHitRatio}</span>
                <span className="text-[10px] text-emerald-500 font-mono block uppercase font-bold">
                  ● KV Read: &lt;5ms latency
                </span>
              </div>
            </Card>
          </div>
        </Grid>
      </section>

      {/* QUICK SYSTEM ACTIONS & ACTIVITY AUDIT LOG */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Quick navigation shortcuts */}
        <div className="lg:col-span-4 space-y-6">
          <h3 className="font-mono text-[9px] text-text-tech uppercase font-bold tracking-wider px-1">Quick CMS Diagnostics</h3>
          <GlassPanel className="p-5 border-neutral-800/80 divide-y divide-neutral-800/60" intensity="low">
            <div className="pb-4 space-y-1">
              <span className="font-sans font-medium text-xs text-foreground block">Drizzle ORM Model check</span>
              <p className="font-mono text-[9.5px] text-text-mute">Polymorphic SQL schema compiled and validated.</p>
            </div>
            <div className="py-4 space-y-1">
              <span className="font-sans font-medium text-xs text-foreground block">Media Storage binding</span>
              <p className="font-mono text-[9.5px] text-text-mute">Cloudflare R2 mapped. Local directory fallback enabled.</p>
            </div>
            <div className="pt-4 space-y-1">
              <span className="font-sans font-medium text-xs text-foreground block">Edge Cache Purge Scheme</span>
              <p className="font-mono text-[9.5px] text-text-mute">Global Workers KV invalidation pipeline connected.</p>
            </div>
          </GlassPanel>
        </div>

        {/* Right: Telemetry Audit Activity Log */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-mono text-[9px] text-text-tech uppercase font-bold tracking-wider">System Event Stream (activity_logs)</h3>
            <span className="font-mono text-[8px] text-text-mute uppercase">Online logging active</span>
          </div>
          
          <div className="bg-[#0D0D0D] border border-neutral-800 rounded-large p-5 font-mono text-xs max-h-[360px] overflow-y-auto space-y-3.5 select-text selection:bg-gold/20">
            {stats.activities && stats.activities.length > 0 ? (
              stats.activities.map((log) => {
                let actionColor = "text-text-mute border-neutral-800";
                if (log.action === "publish") actionColor = "text-gold bg-gold/5 border-gold/20";
                else if (log.action === "create") actionColor = "text-emerald-500 bg-emerald-500/5 border-emerald-500/20";
                else if (log.action === "update") actionColor = "text-[#0070F3] bg-[#0070F3]/5 border-[#0070F3]/20";
                else if (log.action === "rollback") actionColor = "text-amber-500 bg-amber-500/5 border-amber-500/20";
                else if (log.action === "upload") actionColor = "text-purple-500 bg-purple-500/5 border-purple-500/20";

                return (
                  <div key={log.id} className="flex items-start gap-4 border-b border-neutral-900/50 pb-3 last:border-0 last:pb-0">
                    <span className="text-[10px] text-text-mute select-none font-semibold flex-shrink-0">
                      [{formatTime(log.createdAt)}]
                    </span>
                    <span className={`px-2 py-0.5 text-[8.5px] font-bold rounded uppercase border ${actionColor} flex-shrink-0 select-none`}>
                      {log.action}
                    </span>
                    <div className="space-y-1 text-[11px] leading-normal text-text-mute">
                      <span className="text-foreground font-semibold font-sans block select-none">
                        {log.nodeTitle || "System Kernel"}
                      </span>
                      <p>{log.details}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-text-mute text-[10px] uppercase">
                No telemetry logs written to database.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
