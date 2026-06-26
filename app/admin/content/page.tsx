"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  Plus, 
  FileText, 
  Edit, 
  Trash2, 
  Globe, 
  Eye, 
  Activity, 
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { Card } from "../../../src/shared/components/ui/card";
import { Button } from "../../../src/shared/components/ui/button";

interface ContentNode {
  id: string;
  slug: string;
  type: string;
  title: string;
  summary: string;
  status: "draft" | "published" | "archived";
  version: string;
  updatedAt: string;
}

export default function ContentManagerPage() {
  const [nodes, setNodes] = useState<ContentNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Pipeline execution feedback
  const [pipelineAlert, setPipelineAlert] = useState<{
    type: "success" | "warning" | "error";
    message: string;
    warnings?: string[];
  } | null>(null);

  // Fetch nodes from API
  const fetchNodes = () => {
    setLoading(true);
    fetch("/api/cms/nodes")
      .then((res) => res.json())
      .then((data) => {
        setNodes(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load content nodes:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchNodes();
  }, []);

  // Trigger publishing pipeline dynamically
  const handlePublish = async (nodeId: string, title: string) => {
    setPipelineAlert(null);
    try {
      const res = await fetch(`/api/cms/nodes/${nodeId}/publish`, {
        method: "POST"
      });
      const data = await res.json();
      
      if (data.success) {
        if (data.warnings && data.warnings.length > 0) {
          setPipelineAlert({
            type: "warning",
            message: `Node "${title}" published with ${data.warnings.length} SEO warnings.`,
            warnings: data.warnings
          });
        } else {
          setPipelineAlert({
            type: "success",
            message: `Node "${title}" published successfully with clean SEO scoring.`
          });
        }
        fetchNodes(); // Reload list
      } else {
        setPipelineAlert({
          type: "error",
          message: `Publishing failed: ${data.details || "Pipeline execution error."}`
        });
      }
    } catch (err: any) {
      setPipelineAlert({
        type: "error",
        message: `Network error triggering publishing pipeline: ${err?.message}`
      });
    }
  };

  // Handle delete action
  const handleDelete = async (nodeId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete the content node "${title}"? This will cascade-delete all versions and relations in the database.`)) {
      return;
    }
    
    try {
      const res = await fetch(`/api/cms/nodes/${nodeId}`, {
        method: "DELETE"
      });
      const data = await res.json();
      
      if (data.success) {
        setPipelineAlert({
          type: "success",
          message: `Successfully deleted node: ${title}`
        });
        fetchNodes();
      } else {
        setPipelineAlert({
          type: "error",
          message: `Deletion failed: ${data.error}`
        });
      }
    } catch (err: any) {
      setPipelineAlert({
        type: "error",
        message: `Network error deleting content: ${err?.message}`
      });
    }
  };

  // Group content types dynamically for filters
  const nodeTypes = ["All", ...Array.from(new Set(nodes.map((n) => n.type)))];
  const statuses = ["All", "draft", "published", "archived"];

  // Filter logic
  const filteredNodes = nodes.filter((node) => {
    const matchesSearch = 
      node.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "All" || node.type === selectedType;
    const matchesStatus = selectedStatus === "All" || node.status === selectedStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-neutral-800 pb-6">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-foreground">Content Registry.</h1>
          <p className="text-xs text-text-mute">Manage and audit the relational knowledge nodes forming Cole.dev.</p>
        </div>
        <Link href="/admin/editor">
          <Button size="sm" className="bg-gold hover:bg-gold/90 text-black border border-gold/15">
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            <span>New Content Node</span>
          </Button>
        </Link>
      </section>

      {/* Dynamic alert feedback banner */}
      {pipelineAlert && (
        <section>
          <div className={`p-4 rounded-medium border text-xs flex gap-3 ${
            pipelineAlert.type === "success" 
              ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
              : pipelineAlert.type === "warning"
                ? "bg-amber-500/5 border-amber-500/20 text-amber-400"
                : "bg-red-500/5 border-red-500/20 text-red-400"
          }`}>
            {pipelineAlert.type === "success" && <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-500" />}
            {pipelineAlert.type === "warning" && <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-gold" />}
            {pipelineAlert.type === "error" && <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />}
            
            <div className="space-y-2">
              <span className="font-semibold block">{pipelineAlert.message}</span>
              {pipelineAlert.warnings && pipelineAlert.warnings.length > 0 && (
                <ul className="list-disc pl-4 space-y-1 font-mono text-[10px] text-text-mute">
                  {pipelineAlert.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              )}
            </div>
            <button 
              onClick={() => setPipelineAlert(null)}
              className="ml-auto p-0.5 text-text-mute hover:text-foreground self-start font-mono text-[9px] border border-transparent hover:border-neutral-800 rounded"
            >
              DISMISS
            </button>
          </div>
        </section>
      )}

      {/* Filter HUD */}
      <section className="bg-[#0E0E0E] border border-neutral-800 rounded-large p-5 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Live Search Box */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-mute" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, slug, or content terms..."
              className="w-full bg-transparent border border-neutral-800 focus:border-gold focus:outline-none rounded-medium pl-9 pr-4 py-2 text-xs font-sans transition-colors text-foreground"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto scrollbar-none">
            <span className="font-mono text-[9px] text-text-mute uppercase font-semibold flex-shrink-0">Filter:</span>
            {/* Type selector */}
            <div className="flex bg-neutral-900 border border-neutral-800 rounded-medium p-0.5">
              {nodeTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-3 py-1 rounded font-mono text-[9px] uppercase cursor-pointer ${
                    selectedType === type
                      ? "bg-gold/10 text-white border border-gold/15 font-semibold"
                      : "text-text-mute hover:text-foreground"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Database Node Grid Table */}
      <section>
        <Card className="border-neutral-800 bg-[#0E0E0E] overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex h-48 w-full items-center justify-center">
              <Activity className="h-5 w-5 animate-spin text-gold" />
            </div>
          ) : filteredNodes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse font-sans">
                <thead>
                  <tr className="border-b border-neutral-800 bg-neutral-900/45 font-mono text-[9px] text-text-tech uppercase tracking-wider select-none">
                    <th className="p-4 font-bold">Node Title & Category</th>
                    <th className="p-4 font-bold">Slug Routing Coordinate</th>
                    <th className="p-4 font-bold">Version</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold">Last Modified</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNodes.map((node) => {
                    return (
                      <tr key={node.id} className="border-b border-neutral-900 last:border-0 hover:bg-neutral-900/20 transition-colors">
                        {/* Title and Badge */}
                        <td className="p-4 max-w-xs">
                          <div className="space-y-1">
                            <span className="font-semibold text-foreground text-xs block">{node.title}</span>
                            <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-800 text-[8.5px] font-mono text-gold rounded uppercase font-bold tracking-wider">
                              {node.type}
                            </span>
                          </div>
                        </td>
                        
                        {/* Slug */}
                        <td className="p-4 font-mono text-text-mute text-[10px]">
                          /{node.type}s/{node.slug}
                        </td>
                        
                        {/* Version */}
                        <td className="p-4 font-mono text-text-tech text-[10px]">
                          {node.version}
                        </td>
                        
                        {/* Status */}
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase">
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              node.status === "published" 
                                ? "bg-emerald-500 animate-pulse" 
                                : node.status === "draft" 
                                  ? "bg-blue-500" 
                                  : "bg-neutral-600"
                            }`} />
                            <span className="text-text-mute font-semibold">{node.status}</span>
                          </div>
                        </td>
                        
                        {/* Last modified */}
                        <td className="p-4 text-text-mute text-[10px] font-mono">
                          {new Date(node.updatedAt).toLocaleDateString()}
                        </td>
                        
                        {/* Action buttons */}
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2.5">
                            {/* Edit */}
                            <Link href={`/admin/editor/${node.id}`}>
                              <button 
                                className="p-2 bg-neutral-900 border border-neutral-800 hover:border-gold hover:text-gold text-text-mute rounded-medium transition-colors"
                                title="Edit Content Node"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                            </Link>

                            {/* Publish (if draft) */}
                            {node.status !== "published" && (
                              <button 
                                onClick={() => handlePublish(node.id, node.title)}
                                className="p-2 bg-neutral-900 border border-neutral-800 hover:border-emerald-500 hover:text-emerald-500 text-text-mute rounded-medium transition-colors"
                                title="Trigger Event-Driven Publish"
                              >
                                <Globe className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Delete */}
                            <button 
                              onClick={() => handleDelete(node.id, node.title)}
                              className="p-2 bg-neutral-900 border border-neutral-800 hover:border-red-500 hover:text-red-500 text-text-mute rounded-medium transition-colors"
                              title="Delete content (Cascade)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center space-y-3 font-mono text-[9px] text-text-mute uppercase">
              <FileText className="w-6 h-6 text-gold/50 mx-auto" />
              <p>No content nodes found matching active filters.</p>
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}
