"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Save, 
  Globe, 
  History, 
  Sliders, 
  Eye, 
  Cpu, 
  Terminal as TerminalIcon,
  ShieldAlert,
  HelpCircle,
  Clock,
  Link as LinkIcon,
  AlertTriangle,
  CheckCircle,
  Activity
} from "lucide-react";
import Link from "next/link";
import { Card } from "../../../src/shared/components/ui/card";
import { GlassPanel } from "../../../src/shared/components/ui/glass-panel";
import { Terminal } from "../../../src/shared/components/ui/terminal";
import { Button } from "../../../src/shared/components/ui/button";
import ComparisonSlider from "@/features/projects/comparison-slider";

interface EditorContainerProps {
  nodeId: string;
}

// Utility to convert text into URL-friendly IDs for anchors and slugs
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .trim();
}

export default function EditorContainer({ nodeId }: EditorContainerProps) {
  const router = useRouter();
  const isNew = nodeId === "new";
  
  // Core Node States
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [type, setType] = useState("project");
  const [summary, setSummary] = useState("");
  const [bodyContent, setBodyContent] = useState("");
  const [version, setVersion] = useState("1.0.0");
  const [status, setStatus] = useState("draft");
  
  // SEO States
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");
  const [seoCanonical, setSeoCanonical] = useState("");
  
  // Polymorphic Metadata States
  const [latencyMetric, setLatencyMetric] = useState("");
  const [scaleMetric, setScaleMetric] = useState("");
  const [category, setCategory] = useState("");
  const [role, setRole] = useState("");
  const [duration, setDuration] = useState("");
  const [completionDate, setCompletionDate] = useState("");
  const [difficulty, setDifficulty] = useState("Advanced");
  const [architectureStyle, setArchitectureStyle] = useState("");
  const [cloudProvider, setCloudProvider] = useState("Cloudflare");
  const [teamSize, setTeamSize] = useState(1);
  const [tags, setTags] = useState("");
  const [iconKey, setIconKey] = useState("cpu");
  const [accentColor, setAccentColor] = useState("");
  const [virtualQuestions, setVirtualQuestions] = useState("");
  
  // Experience Specifics
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [achievements, setAchievements] = useState("");
  
  // Pipeline & Editor States
  const [allNodes, setAllNodes] = useState<any[]>([]);
  const [versionsHistory, setVersionsHistory] = useState<any[]>([]);
  const [selectedRelations, setSelectedRelations] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");
  const [sidebarPanel, setSidebarPanel] = useState<"metadata" | "relations" | "versions">("metadata");
  const [loading, setLoading] = useState(true);
  
  // Alert Banner State
  const [alert, setAlert] = useState<{
    type: "success" | "warning" | "error";
    message: string;
    warnings?: string[];
  } | null>(null);

  // 1. Fetch Node Details on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch list of all nodes for relation mapping
        const nodesRes = await fetch("/api/cms/nodes");
        const nodesData = await nodesRes.json();
        setAllNodes(nodesData.filter((n: any) => n.id !== nodeId)); // Exclude self

        if (!isNew) {
          // Fetch target content node
          const res = await fetch(`/api/cms/nodes/${nodeId}`);
          if (res.status === 404) {
            router.push("/admin/content");
            return;
          }
          const node = await res.json();

          // Map core states
          setTitle(node.title);
          setSlug(node.slug);
          setType(node.type);
          setSummary(node.summary || "");
          setBodyContent(node.body || "");
          setVersion(node.version);
          setStatus(node.status);
          
          // Map SEO states
          setSeoTitle(node.seoTitle || "");
          setSeoDescription(node.seoDescription || "");
          setSeoKeywords(node.seoKeywords || "");
          setSeoCanonical(node.seoCanonical || "");

          // Parse and Map Polymorphic Metadata
          if (node.extraMetadata) {
            const meta = JSON.parse(node.extraMetadata);
            if (node.type === "project") {
              setLatencyMetric(meta.latencyMetric || "");
              setScaleMetric(meta.scaleMetric || "");
              setCategory(meta.category || "");
              setRole(meta.role || "");
              setDuration(meta.duration || "");
              setCompletionDate(meta.completionDate || "");
              setDifficulty(meta.difficulty || "Advanced");
              setArchitectureStyle(meta.architectureStyle || "");
              setCloudProvider(meta.cloudProvider || "Cloudflare");
              setTeamSize(meta.teamSize || 1);
              setTags(meta.tags?.join(", ") || "");
              setIconKey(meta.iconKey || "cpu");
              setAccentColor(meta.accentColor || "");
              setVirtualQuestions(meta.virtualColeQuestions?.join("\n") || "");
            } else if (node.type === "timeline" || node.type === "experience") {
              setCompany(meta.company || "");
              setLocation(meta.location || "");
              setDuration(meta.duration || "");
              setRole(meta.role || "");
              setAchievements(meta.achievements?.join("\n") || "");
              setTags(meta.tags?.join(", ") || "");
            }
          }

          // Fetch version history snapshots
          const verRes = await fetch(`/api/cms/nodes/${nodeId}/versions`);
          const verData = await verRes.json();
          setVersionsHistory(verData);
        }
      } catch (err) {
        console.error("Failed to load editor metadata:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [nodeId, isNew]);

  // Sync title to slug dynamically if it is a new content item
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (isNew) {
      setSlug(slugify(val));
    }
  };

  // Compile extraMetadata JSON string based on active type
  const compileExtraMetadata = (): string => {
    if (type === "project") {
      return JSON.stringify({
        category,
        role,
        duration,
        completionDate,
        version,
        status: status === "published" ? "Production" : "Beta",
        difficulty,
        architectureStyle,
        cloudProvider,
        teamSize: Number(teamSize),
        tags: tags.split(",").map(t => t.trim()).filter(Boolean),
        latencyMetric,
        scaleMetric,
        iconKey,
        accentColor,
        virtualColeQuestions: virtualQuestions.split("\n").map(q => q.trim()).filter(Boolean),
        links: {
          github: `https://github.com/ColeAllStar/${slug}`,
          live: `https://${slug}.coleallstar.web.id`
        }
      });
    } else if (type === "timeline" || type === "experience") {
      return JSON.stringify({
        role,
        company,
        location,
        duration,
        achievements: achievements.split("\n").map(a => a.trim()).filter(Boolean),
        tags: tags.split(",").map(t => t.trim()).filter(Boolean),
        type: type === "timeline" ? "project" : "work"
      });
    }
    return "{}";
  };

  // 2. SAVE ACTION (POST for new, PUT for existing)
  const handleSave = async () => {
    setAlert(null);
    try {
      const extraMetadata = compileExtraMetadata();
      const payload = {
        title,
        slug,
        type,
        summary,
        bodyContent,
        version,
        extraMetadata,
        seoTitle: seoTitle || title,
        seoDescription: seoDescription || summary,
        seoKeywords,
        seoCanonical
      };

      if (isNew) {
        const res = await fetch("/api/cms/nodes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (res.ok) {
          setAlert({ type: "success", message: `Successfully created draft: ${title}` });
          // Redirect to the edit route for this new ID
          setTimeout(() => {
            router.push(`/admin/editor/${data.id}`);
          }, 1000);
        } else {
          setAlert({ type: "error", message: data.error || "Failed to create node" });
        }
      } else {
        const res = await fetch(`/api/cms/nodes/${nodeId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (res.ok) {
          setAlert({ type: "success", message: `Successfully saved node changes: ${title}` });
          
          // Refresh version history registry
          const verRes = await fetch(`/api/cms/nodes/${nodeId}/versions`);
          const verData = await verRes.json();
          setVersionsHistory(verData);
        } else {
          setAlert({ type: "error", message: data.error || "Failed to save node updates" });
        }
      }
    } catch (err: any) {
      setAlert({ type: "error", message: `Network error saving content: ${err?.message}` });
    }
  };

  // 3. PUBLISH TRIGGER PIPELINE
  const handlePublish = async () => {
    if (isNew) return;
    setAlert(null);
    try {
      // First auto-save any pending changes
      await handleSave();

      const res = await fetch(`/api/cms/nodes/${nodeId}/publish`, {
        method: "POST"
      });
      const data = await res.json();

      if (data.success) {
        setStatus("published");
        if (data.warnings && data.warnings.length > 0) {
          setAlert({
            type: "warning",
            message: `Node published successfully with ${data.warnings.length} SEO warnings.`,
            warnings: data.warnings
          });
        } else {
          setAlert({
            type: "success",
            message: "Node published successfully with optimal SEO compliance scores."
          });
        }
      } else {
        setAlert({
          type: "error",
          message: `Publishing pipeline failed: ${data.details}`
        });
      }
    } catch (err: any) {
      setAlert({ type: "error", message: `Network error triggering publishing: ${err?.message}` });
    }
  };

  // 4. VERSION ROLLBACK ACTION
  const handleRollback = async (versionId: string, verString: string) => {
    setAlert(null);
    if (!confirm(`Are you sure you want to revert this content node to version ${verString}? This will overwrite your current workspace.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/cms/nodes/${nodeId}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ versionId })
      });
      const data = await res.json();

      if (data.success) {
        setAlert({ type: "success", message: `Reverted content successfully to version ${verString}.` });
        
        // Reload page states from response
        setTitle(data.node.title);
        setSlug(data.node.slug);
        setSummary(data.node.summary || "");
        setBodyContent(data.node.body || "");
        
        if (data.node.extraMetadata) {
          const meta = JSON.parse(data.node.extraMetadata);
          if (type === "project") {
            setLatencyMetric(meta.latencyMetric || "");
            setScaleMetric(meta.scaleMetric || "");
          }
        }
      } else {
        setAlert({ type: "error", message: `Rollback failed: ${data.error}` });
      }
    } catch (err: any) {
      setAlert({ type: "error", message: `Network error rolling back: ${err?.message}` });
    }
  };

  // 5. EDGE-NATIVE MARKDOWN PARSER (Real-time preview)
  const parsePreviewContent = (markdownText: string) => {
    const blocks = markdownText.split(/\n(?=(?:##?#? |```|> \[!|\|))/);
    
    return blocks.map((block, idx) => {
      const trimmed = block.trim();
      if (!trimmed) return null;

      if (trimmed.startsWith("## ")) {
        const text = trimmed.replace("## ", "").trim();
        return (
          <h2 
            key={idx} 
            className="font-sans font-medium text-xs text-gold mt-8 mb-3.5 border-b border-neutral-800 pb-2 tracking-widest uppercase font-mono"
          >
            {text}
          </h2>
        );
      }

      if (trimmed.startsWith("### ")) {
        const text = trimmed.replace("### ", "").trim();
        return (
          <h3 key={idx} className="font-sans font-medium text-xs text-foreground mt-6 mb-2.5 tracking-tight font-semibold">
            {text}
          </h3>
        );
      }

      if (trimmed.startsWith("```")) {
        const lines = trimmed.split("\n");
        const firstLine = lines[0].replace("```", "").trim();
        const langAndTitle = firstLine.split(":");
        const pTitle = langAndTitle[1] || langAndTitle[0] || "source.code";
        const codeLines = lines.slice(1, -1);
        
        return (
          <div key={idx} className="my-5">
            <Terminal title={pTitle} lines={codeLines} showControls={true} />
          </div>
        );
      }

      if (trimmed.startsWith("> [!")) {
        const lines = trimmed.split("\n");
        const alertHeader = lines[0];
        const alertType = alertHeader.match(/\[!(.*)\]/)?.[1] || "IMPORTANT";
        const text = lines.slice(1).map(l => l.replace(/^>\s?/, "")).join("\n");
        
        return (
          <div key={idx} className="my-5 p-4 bg-gold/5 border border-gold/15 rounded-medium flex gap-3">
            <ShieldAlert className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed text-text-mute space-y-1 font-sans">
              <strong className="text-foreground uppercase font-mono text-[8px] tracking-wider block">{alertType}</strong>
              <p>{text}</p>
            </div>
          </div>
        );
      }

      if (trimmed.startsWith("|")) {
        const lines = trimmed.split("\n");
        const rows = lines.map(line => line.split("|").map(cell => cell.trim()).filter(Boolean));
        if (rows.length < 2) return null;
        
        const headers = rows[0];
        const dataRows = rows.slice(2);
        
        return (
          <div key={idx} className="my-4 overflow-x-auto border border-neutral-800 rounded-large">
            <table className="w-full text-[10px] font-mono text-left border-collapse bg-[#0E0E0E]">
              <thead>
                <tr className="border-b border-neutral-800 text-text-mute bg-neutral-900/60">
                  {headers.map((h, i) => (
                    <th key={i} className="p-2 font-semibold uppercase text-[7.5px] tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataRows.map((row, rIdx) => (
                  <tr key={rIdx} className="border-b border-neutral-900 last:border-0 hover:bg-neutral-900/30">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-2 text-text-mute">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      return (
        <p 
          key={idx} 
          className="text-[11px] text-text-mute leading-relaxed my-3 font-sans whitespace-pre-line"
          dangerouslySetInnerHTML={{
            __html: trimmed
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/`(.*?)`/g, '<code class="px-1 py-0.5 bg-neutral-900 border border-neutral-800 font-mono text-[9.5px] rounded text-foreground">$1</code>')
          }}
        />
      );
    });
  };

  if (loading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Activity className="h-5 w-5 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none">
      {/* 1. TOP NAV CONTROL PANEL */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-800 pb-5">
        <div className="flex items-center gap-4">
          <Link href="/admin/content" className="p-2 bg-neutral-900 border border-neutral-800 hover:border-gold hover:text-gold rounded-full text-text-mute transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-foreground tracking-tight">
              {isNew ? "Create Knowledge Node" : `Editor: ${title}`}
            </h1>
            <div className="flex items-center gap-2 mt-1 font-mono text-[9px] text-text-mute">
              <span className="px-1.5 py-0.5 bg-neutral-900 border border-neutral-800 rounded uppercase font-bold text-gold">
                {type}
              </span>
              <span>●</span>
              <span className="uppercase">STATUS: {status}</span>
              <span>●</span>
              <span>VERSION: {version}</span>
            </div>
          </div>
        </div>

        {/* Sync / Publish / Rollback Controls */}
        <div className="flex items-center gap-3">
          {/* Save Button */}
          <Button size="sm" onClick={handleSave} className="bg-neutral-900 hover:bg-neutral-800 text-foreground border border-neutral-800 flex items-center gap-1.5">
            <Save className="w-3.5 h-3.5 text-gold" />
            <span>Save Draft</span>
          </Button>

          {/* Publish Button (Disabled for new nodes until saved) */}
          <Button 
            size="sm" 
            onClick={handlePublish}
            disabled={isNew}
            className="bg-gold hover:bg-gold/90 text-black border border-gold/10 flex items-center gap-1.5 disabled:opacity-50"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Publish Node</span>
          </Button>
        </div>
      </section>

      {/* Pipeline Alert message */}
      {alert && (
        <section>
          <div className={`p-4 rounded-medium border text-xs flex gap-3 ${
            alert.type === "success" 
              ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
              : alert.type === "warning"
                ? "bg-amber-500/5 border-amber-500/20 text-amber-400"
                : "bg-red-500/5 border-red-500/20 text-red-400"
          }`}>
            {alert.type === "success" && <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-500" />}
            {alert.type === "warning" && <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-gold" />}
            {alert.type === "error" && <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />}
            
            <div className="space-y-2">
              <span className="font-semibold block">{alert.message}</span>
              {alert.warnings && alert.warnings.length > 0 && (
                <ul className="list-disc pl-4 space-y-1 font-mono text-[10px] text-text-mute">
                  {alert.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              )}
            </div>
            <button onClick={() => setAlert(null)} className="ml-auto font-mono text-[9px] text-text-mute self-start">DISMISS</button>
          </div>
        </section>
      )}

      {/* 2. SPLIT-SCREEN WORKSPACE */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Editor Panels (Inputs & Markdown) */}
        <div className="lg:col-span-8 space-y-5">
          <div className="flex bg-neutral-950 border border-neutral-800 rounded-medium p-0.5 max-w-[200px] mb-2">
            <button
              onClick={() => setActiveTab("editor")}
              className={`flex-grow py-1 px-3 text-center font-mono text-[9px] uppercase cursor-pointer ${
                activeTab === "editor" ? "bg-neutral-900 border border-neutral-800 text-white font-bold rounded" : "text-text-mute hover:text-foreground"
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`flex-grow py-1 px-3 text-center font-mono text-[9px] uppercase cursor-pointer ${
                activeTab === "preview" ? "bg-neutral-900 border border-neutral-800 text-white font-bold rounded" : "text-text-mute hover:text-foreground"
              }`}
            >
              Live Preview
            </button>
          </div>

          <Card className="border-neutral-800 bg-[#0E0E0E] p-6 space-y-5 shadow-sm">
            {activeTab === "editor" ? (
              <div className="space-y-5">
                {/* Type, Title & Slug Row */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-3 space-y-1.5">
                    <label className="font-mono text-[8.5px] text-text-mute uppercase font-bold tracking-wider">Node Type</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      disabled={!isNew}
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-gold focus:outline-none rounded-medium px-3 py-2.5 text-xs text-foreground disabled:opacity-50"
                    >
                      <option value="project">Project</option>
                      <option value="article">Blog Article</option>
                      <option value="timeline">Timeline</option>
                      <option value="experience">Experience</option>
                    </select>
                  </div>

                  <div className="md:col-span-6 space-y-1.5">
                    <label className="font-mono text-[8.5px] text-text-mute uppercase font-bold tracking-wider">Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="e.g., Boundary Shield Edge Firewall"
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-gold focus:outline-none rounded-medium px-3.5 py-2.5 text-xs text-foreground"
                    />
                  </div>

                  <div className="md:col-span-3 space-y-1.5">
                    <label className="font-mono text-[8.5px] text-text-mute uppercase font-bold tracking-wider">Version ID</label>
                    <input
                      type="text"
                      value={version}
                      onChange={(e) => setVersion(e.target.value)}
                      placeholder="v1.0.0"
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-gold focus:outline-none rounded-medium px-3.5 py-2.5 text-xs text-foreground font-mono"
                    />
                  </div>
                </div>

                {/* Slug display */}
                <div className="space-y-1.5">
                  <label className="font-mono text-[8.5px] text-text-mute uppercase font-bold tracking-wider">Slug Coordinate (URL Route)</label>
                  <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-medium px-3.5 py-2.5">
                    <span className="text-neutral-600 text-xs select-none font-mono">/{type}s/</span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(slugify(e.target.value))}
                      placeholder="boundary-shield-waf"
                      className="flex-grow bg-transparent border-0 focus:outline-none text-xs text-foreground font-mono ml-0.5"
                    />
                  </div>
                </div>

                {/* Summary */}
                <div className="space-y-1.5">
                  <label className="font-mono text-[8.5px] text-text-mute uppercase font-bold tracking-wider">Summary Description</label>
                  <input
                    type="text"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Provide a single-line summary of this knowledge node..."
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-gold focus:outline-none rounded-medium px-3.5 py-2.5 text-xs text-foreground"
                  />
                </div>

                {/* large Monospaced Markdown Textarea */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="font-mono text-[8.5px] text-text-mute uppercase font-bold tracking-wider">Markdown Narrative (Journal Body)</label>
                    <span className="font-mono text-[8px] text-neutral-600">CHAR_COUNT: {bodyContent.length}</span>
                  </div>
                  <textarea
                    value={bodyContent}
                    onChange={(e) => setBodyContent(e.target.value)}
                    placeholder="# Executive Summary & Challenge..."
                    rows={16}
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-gold focus:outline-none rounded-medium p-4 text-xs font-mono leading-relaxed text-foreground select-text selection:bg-gold/20"
                  />
                </div>
              </div>
            ) : (
              /* REAL-TIME PREVIEW PANEL */
              <div className="min-h-[420px] select-text selection:bg-gold/15">
                <div className="border-b border-neutral-800 pb-5 mb-5 space-y-2">
                  <span className="px-2 py-0.5 bg-neutral-950 border border-neutral-800 text-[8.5px] font-mono text-gold rounded uppercase font-bold tracking-wider">
                    {category || type}
                  </span>
                  <h1 className="font-sans font-medium text-xl text-foreground tracking-tight leading-none mt-2">
                    {title || "Untitled Knowledge Node"}
                  </h1>
                  <p className="text-xs text-text-mute leading-relaxed">{summary || "Node description summary placeholder."}</p>
                </div>
                
                <div className="prose prose-neutral dark:prose-invert max-w-none text-xs leading-relaxed text-text-mute space-y-5">
                  {bodyContent ? (
                    parsePreviewContent(bodyContent)
                  ) : (
                    <p className="text-center text-text-mute font-mono py-12 text-[9px] uppercase">Narrative content is empty. Type in the editor to sync preview.</p>
                  )}
                </div>

                {/* Renders dynamic slider placeholder in preview if type is project */}
                {type === "project" && (
                  <div className="mt-8 pt-6 border-t border-neutral-800 space-y-3">
                    <span className="font-mono text-[8px] text-gold uppercase tracking-wider block">[ Telemetry Preview slider ]</span>
                    <ComparisonSlider 
                      beforeTitle="TRADITIONAL WORKLOAD" 
                      afterTitle="EDGE NATIVE ROUTER" 
                      beforeLabel={latencyMetric ? `Centralized: ${latencyMetric}` : "Central Database lockout"}
                      afterLabel={scaleMetric ? `Edge: ${scaleMetric}` : "12ms event sync flow"}
                    />
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* RIGHT COLUMN: Sidebar Accordions (Polymorphic Metadata, SEO, Versions) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Sidebar Tab Selectors */}
          <div className="flex bg-neutral-950 border border-neutral-800 rounded-medium p-0.5">
            <button
              onClick={() => setSidebarPanel("metadata")}
              className={`flex-grow py-2 text-center font-mono text-[8.5px] uppercase font-semibold cursor-pointer ${
                sidebarPanel === "metadata" ? "bg-neutral-900 border border-neutral-800 text-white rounded" : "text-text-mute hover:text-foreground"
              }`}
            >
              Metadata
            </button>
            <button
              onClick={() => setSidebarPanel("relations")}
              className={`flex-grow py-2 text-center font-mono text-[8.5px] uppercase font-semibold cursor-pointer ${
                sidebarPanel === "relations" ? "bg-neutral-900 border border-neutral-800 text-white rounded" : "text-text-mute hover:text-foreground"
              }`}
              disabled={isNew}
            >
              Relations
            </button>
            <button
              onClick={() => setSidebarPanel("versions")}
              className={`flex-grow py-2 text-center font-mono text-[8.5px] uppercase font-semibold cursor-pointer ${
                sidebarPanel === "versions" ? "bg-neutral-900 border border-neutral-800 text-white rounded" : "text-text-mute hover:text-foreground"
              }`}
              disabled={isNew}
            >
              History
            </button>
          </div>

          <GlassPanel className="p-5 border-neutral-800 bg-[#0E0E0E]/80 shadow-sm" intensity="low">
            {/* PANEL A: POLYMORPHIC & SEO METADATA */}
            {sidebarPanel === "metadata" && (
              <div className="space-y-6">
                {/* 1. Type Specific Polymorphic Fields */}
                {type === "project" && (
                  <div className="space-y-4">
                    <span className="font-mono text-[8.5px] text-gold uppercase tracking-wider block font-bold border-b border-neutral-800 pb-2">
                      Project Schema Attributes
                    </span>
                    
                    <div className="space-y-1.5">
                      <label className="font-mono text-[8px] text-text-mute uppercase">Project Category</label>
                      <input type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g., AI Routing Systems" className="w-full bg-neutral-950 border border-neutral-800 focus:border-gold focus:outline-none rounded px-3 py-2 text-[11px] text-foreground" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="font-mono text-[8px] text-text-mute uppercase">Latency speed</label>
                        <input type="text" value={latencyMetric} onChange={e => setLatencyMetric(e.target.value)} placeholder="e.g., 38ms p95" className="w-full bg-neutral-950 border border-neutral-800 focus:border-gold focus:outline-none rounded px-3 py-2 text-[11px] text-foreground font-mono" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-mono text-[8px] text-text-mute uppercase">Scale capacity</label>
                        <input type="text" value={scaleMetric} onChange={e => setScaleMetric(e.target.value)} placeholder="e.g., 1.2M logs/sec" className="w-full bg-neutral-950 border border-neutral-800 focus:border-gold focus:outline-none rounded px-3 py-2 text-[11px] text-foreground font-mono" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-mono text-[8px] text-text-mute uppercase">Technology stack (comma separated)</label>
                      <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g., Drizzle ORM, SQLite" className="w-full bg-neutral-950 border border-neutral-800 focus:border-gold focus:outline-none rounded px-3 py-2 text-[11px] text-foreground font-mono" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="font-mono text-[8px] text-text-mute uppercase">Difficulty</label>
                        <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 focus:border-gold focus:outline-none rounded px-3 py-2 text-[11px] text-foreground">
                          <option value="Advanced">Advanced</option>
                          <option value="Expert">Expert</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-mono text-[8px] text-text-mute uppercase">Cloud Provider</label>
                        <input type="text" value={cloudProvider} onChange={e => setCloudProvider(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 focus:border-gold focus:outline-none rounded px-3 py-2 text-[11px] text-foreground" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-mono text-[8px] text-text-mute uppercase">Virtual Cole RAG Qs (one per line)</label>
                      <textarea value={virtualQuestions} onChange={e => setVirtualQuestions(e.target.value)} placeholder="What is the average latency of this system?" rows={3} className="w-full bg-neutral-950 border border-neutral-800 focus:border-gold focus:outline-none rounded p-2.5 text-[10px] font-mono text-foreground" />
                    </div>
                  </div>
                )}

                {/* Experience specific details */}
                {(type === "timeline" || type === "experience") && (
                  <div className="space-y-4">
                    <span className="font-mono text-[8.5px] text-gold uppercase tracking-wider block font-bold border-b border-neutral-800 pb-2">
                      Experience Schema Attributes
                    </span>

                    <div className="space-y-1.5">
                      <label className="font-mono text-[8px] text-text-mute uppercase">Company/Provider</label>
                      <input type="text" value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g., Teknovo AI Systems" className="w-full bg-neutral-950 border border-neutral-800 focus:border-gold focus:outline-none rounded px-3 py-2 text-[11px] text-foreground" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="font-mono text-[8px] text-text-mute uppercase">Role Title</label>
                        <input type="text" value={role} onChange={e => setRole(e.target.value)} placeholder="Senior AI Engineer" className="w-full bg-neutral-950 border border-neutral-800 focus:border-gold focus:outline-none rounded px-3 py-2 text-[11px] text-foreground" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-mono text-[8px] text-text-mute uppercase">Location</label>
                        <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Jakarta, ID" className="w-full bg-neutral-950 border border-neutral-800 focus:border-gold focus:outline-none rounded px-3 py-2 text-[11px] text-foreground" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-mono text-[8px] text-text-mute uppercase">Duration string</label>
                      <input type="text" value={duration} onChange={e => setDuration(e.target.value)} placeholder="2024 - Present" className="w-full bg-neutral-950 border border-neutral-800 focus:border-gold focus:outline-none rounded px-3 py-2 text-[11px] text-foreground font-mono" />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-mono text-[8px] text-text-mute uppercase">Achievements (one per line)</label>
                      <textarea value={achievements} onChange={e => setAchievements(e.target.value)} placeholder="Reduced query overheads by 45%." rows={4} className="w-full bg-neutral-950 border border-neutral-800 focus:border-gold focus:outline-none rounded p-2.5 text-[10px] font-mono text-foreground" />
                    </div>
                  </div>
                )}

                {/* 2. SEO Meta Fields */}
                <div className="space-y-4 pt-4 border-t border-neutral-800">
                  <span className="font-mono text-[8.5px] text-gold uppercase tracking-wider block font-bold border-b border-neutral-800 pb-2">
                    SEO Automation Overrides
                  </span>

                  <div className="space-y-1.5">
                    <label className="font-mono text-[8px] text-text-mute uppercase">Meta Title Override</label>
                    <input type="text" value={seoTitle} onChange={e => setSeoTitle(e.target.value)} placeholder={title} className="w-full bg-neutral-950 border border-neutral-800 focus:border-gold focus:outline-none rounded px-3 py-2 text-[11px] text-foreground" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-mono text-[8px] text-text-mute uppercase">Meta Description Override</label>
                    <textarea value={seoDescription} onChange={e => setSeoDescription(e.target.value)} placeholder={summary} rows={3} className="w-full bg-neutral-950 border border-neutral-800 focus:border-gold focus:outline-none rounded p-2.5 text-[10px] text-foreground" />
                  </div>
                </div>
              </div>
            )}

            {/* PANEL B: KNOWLEDGE GRAPH CONNECTIONS */}
            {sidebarPanel === "relations" && (
              <div className="space-y-4">
                <span className="font-mono text-[8.5px] text-gold uppercase tracking-wider block font-bold border-b border-neutral-800 pb-2">
                  Knowledge Graph Relations
                </span>
                <p className="text-[10px] text-text-mute leading-normal">
                  Map dynamic relations from this node to other entities in the database. Connected nodes will show in telemetry maps.
                </p>

                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pt-2">
                  {allNodes && allNodes.length > 0 ? (
                    allNodes.map((n) => (
                      <label key={n.id} className="flex items-start gap-2 px-2 py-2.5 hover:bg-neutral-900 rounded border border-transparent hover:border-neutral-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedRelations.includes(n.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRelations(prev => [...prev, n.id]);
                            } else {
                              setSelectedRelations(prev => prev.filter(id => id !== n.id));
                            }
                          }}
                          className="mt-0.5 cursor-pointer accent-gold"
                        />
                        <div className="space-y-0.5">
                          <span className="font-sans text-xs text-foreground font-medium block leading-tight">{n.title}</span>
                          <span className="font-mono text-[7.5px] text-gold uppercase font-bold">{n.type}</span>
                        </div>
                      </label>
                    ))
                  ) : (
                    <span className="font-mono text-[8px] text-text-mute uppercase block text-center py-6">
                      No other nodes available in database.
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* PANEL C: REVISION HISTORY STACK */}
            {sidebarPanel === "versions" && (
              <div className="space-y-4">
                <span className="font-mono text-[8.5px] text-gold uppercase tracking-wider block font-bold border-b border-neutral-800 pb-2">
                  Revision History Log
                </span>
                <p className="text-[10px] text-text-mute leading-normal">
                  Historical snapshots are auto-saved before each publish operation. Select any past revision to rollback the workspace.
                </p>

                <div className="space-y-3.5 max-h-[320px] overflow-y-auto pt-2 font-mono text-[10px]">
                  {versionsHistory && versionsHistory.length > 0 ? (
                    versionsHistory.map((ver) => (
                      <div key={ver.id} className="border border-neutral-800 bg-neutral-950/40 p-3 rounded-medium space-y-2.5">
                        <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                          <span className="text-gold font-bold">VER_{ver.version}</span>
                          <span className="text-[8px] text-text-mute">{new Date(ver.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-[9.5px] text-text-mute leading-normal font-sans">{ver.revisionNotes || "Auto-saved snapshot"}</p>
                        
                        <button
                          onClick={() => handleRollback(ver.id, ver.version)}
                          className="w-full py-1 text-center bg-neutral-900 border border-neutral-800 hover:border-gold hover:text-gold text-[8.5px] uppercase font-bold tracking-wider rounded transition-all cursor-pointer"
                        >
                          Rollback to snapshot
                        </button>
                      </div>
                    ))
                  ) : (
                    <span className="font-mono text-[8px] text-text-mute uppercase block text-center py-6">
                      No revisions saved. Publish node to record snapshots.
                    </span>
                  )}
                </div>
              </div>
            )}
          </GlassPanel>
        </div>
      </section>
    </div>
  );
}
