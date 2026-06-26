"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Upload, 
  Trash2, 
  Copy, 
  FileText, 
  FolderOpen, 
  Image as ImageIcon, 
  Activity, 
  Search, 
  AlertCircle,
  Plus,
  CheckCircle,
  Video,
  FileArchive
} from "lucide-react";
import { Card } from "../../../src/shared/components/ui/card";
import { Button } from "../../../src/shared/components/ui/button";

interface MediaAsset {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  r2Key: string; // Resolvable public URL
  altText: string | null;
  createdAt: string;
}

export default function MediaManagerPage() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Drag and drop states
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Copy feedback states mapped by asset ID
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Status banner alerts
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Fetch media assets
  const fetchMedia = () => {
    setLoading(true);
    fetch("/api/cms/media")
      .then((res) => res.json())
      .then((data) => {
        setAssets(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load media assets:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMedia();
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

  // Copy link to clipboard
  const handleCopyLink = (url: string, id: string) => {
    // Construct absolute URL
    const absoluteUrl = window.location.origin + url;
    navigator.clipboard.writeText(absoluteUrl).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Delete media asset
  const handleDelete = async (id: string, filename: string) => {
    if (!confirm(`Are you sure you want to permanently delete the media asset "${filename}"? This will purge it from physical storage.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/cms/media/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();

      if (data.success) {
        setAlert({ type: "success", message: `Successfully deleted media asset: ${filename}` });
        fetchMedia();
      } else {
        setAlert({ type: "error", message: `Deletion failed: ${data.error}` });
      }
    } catch (err: any) {
      setAlert({ type: "error", message: `Network error deleting media: ${err?.message}` });
    }
  };

  // Trigger file upload API
  const uploadFile = async (file: File) => {
    setUploading(true);
    setAlert(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("altText", `Uploaded asset: ${file.name}`);

      const res = await fetch("/api/cms/media", {
        method: "POST",
        body: formData
      });
      const data = await res.json();

      if (res.ok) {
        setAlert({ type: "success", message: `Successfully uploaded file: ${file.name}` });
        fetchMedia(); // Reload assets grid
      } else {
        setAlert({ type: "error", message: data.error || "Upload failed." });
      }
    } catch (err: any) {
      setAlert({ type: "error", message: `Network error uploading file: ${err?.message}` });
    } finally {
      setUploading(false);
    }
  };

  // Drag & Drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  };

  // Filter logic
  const filteredAssets = assets.filter((asset) =>
    asset.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.mimeType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 select-none">
      {/* Page Header */}
      <section className="border-b border-neutral-800 pb-6">
        <h1 className="text-2xl font-medium tracking-tight text-foreground">Media Vault.</h1>
        <p className="text-xs text-text-mute">Manage Lottie, Mermaid, SVGs, images, and PDF blueprints forming Cole.dev.</p>
      </section>

      {/* Alert Banner */}
      {alert && (
        <section>
          <div className={`p-4 rounded-medium border text-xs flex gap-3 ${
            alert.type === "success" 
              ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
              : "bg-red-500/5 border-red-500/20 text-red-400"
          }`}>
            {alert.type === "success" ? (
              <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            )}
            <span>{alert.message}</span>
            <button onClick={() => setAlert(null)} className="ml-auto font-mono text-[9px] text-text-mute">DISMISS</button>
          </div>
        </section>
      )}

      {/* Grid Layout: Drag & Drop Uploader (Left) vs. Search & Catalog Browser (Right) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* DRAG AND DROP UPLOADER CONTAINER */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="font-mono text-[9px] text-text-tech uppercase font-bold tracking-wider px-1">Upload Terminal</h3>
          
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`h-64 rounded-large border border-dashed flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all ${
              isDragActive 
                ? "border-gold bg-gold/5" 
                : "border-neutral-800 bg-[#0E0E0E] hover:border-neutral-700"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,video/*,application/pdf,application/zip"
            />
            
            {uploading ? (
              <div className="space-y-3">
                <Activity className="w-8 h-8 text-gold animate-spin mx-auto" />
                <span className="font-mono text-[9px] text-text-tech uppercase tracking-widest animate-pulse block">
                  Writing binary to disk...
                </span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto group-hover:border-gold transition-colors">
                  <Upload className="w-4 h-4 text-text-mute hover:text-gold" />
                </div>
                <div className="space-y-1">
                  <span className="font-sans font-medium text-xs text-foreground block">Drag and drop file here</span>
                  <span className="font-mono text-[8px] text-text-mute uppercase block">Or click to browse files</span>
                </div>
                <span className="font-mono text-[8px] bg-neutral-900 border border-neutral-800 text-neutral-500 px-2 py-1 rounded uppercase">
                  Max: 50MB
                </span>
              </div>
            )}
          </div>
        </div>

        {/* MEDIA BLUEPRINT BROWSER */}
        <div className="lg:col-span-8 space-y-4">
          {/* HUD Filter and Search */}
          <div className="flex justify-between items-center gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-mute" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter media by filename or format..."
                className="w-full bg-[#0E0E0E] border border-neutral-800 focus:border-gold focus:outline-none rounded-medium pl-9 pr-4 py-2 text-xs font-sans transition-colors text-foreground"
              />
            </div>
            
            <span className="font-mono text-[9px] text-text-mute uppercase">
              Total: {filteredAssets.length} Blueprints
            </span>
          </div>

          {/* Media Grid Cards */}
          {loading ? (
            <div className="flex h-48 w-full items-center justify-center">
              <Activity className="h-4.5 w-4.5 animate-spin text-gold" />
            </div>
          ) : filteredAssets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredAssets.map((asset) => {
                const isImage = asset.mimeType.startsWith("image/");
                const isVideo = asset.mimeType.startsWith("video/");
                const isArchive = asset.mimeType.includes("zip") || asset.mimeType.includes("tar");

                return (
                  <Card key={asset.id} className="border-neutral-800 bg-[#0E0E0E] overflow-hidden flex flex-col justify-between group shadow-sm h-[220px]">
                    {/* Upper Viewport (Thumbnail or Format Symbol) */}
                    <div className="relative h-28 bg-neutral-900/55 border-b border-neutral-900 flex items-center justify-center overflow-hidden select-none">
                      {isImage ? (
                        <img 
                          src={asset.r2Key} 
                          alt={asset.altText || asset.filename} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : isVideo ? (
                        <Video className="w-8 h-8 text-[#0070F3]/60" />
                      ) : isArchive ? (
                        <FileArchive className="w-8 h-8 text-amber-500/60" />
                      ) : (
                        <FileText className="w-8 h-8 text-gold/60" />
                      )}
                      
                      <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/70 border border-neutral-800 rounded font-mono text-[7px] text-text-tech uppercase font-bold">
                        {asset.mimeType.split("/")[1] || "asset"}
                      </div>
                    </div>

                    {/* Lower Description HUD */}
                    <div className="p-3.5 space-y-3">
                      <div className="space-y-1">
                        <span className="font-sans font-semibold text-xs text-foreground block truncate" title={asset.filename}>
                          {asset.filename}
                        </span>
                        <span className="font-mono text-[8px] text-text-mute block uppercase font-semibold">
                          SIZE: <span className="text-foreground">{formatBytes(asset.sizeBytes)}</span>
                        </span>
                      </div>

                      {/* Utility Action Stack */}
                      <div className="border-t border-neutral-900 pt-2.5 flex justify-between items-center text-[8.5px] font-mono">
                        {/* Copy Link URL */}
                        <button
                          onClick={() => handleCopyLink(asset.r2Key, asset.id)}
                          className="text-text-mute hover:text-gold flex items-center gap-1.5 cursor-pointer font-bold uppercase transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{copiedId === asset.id ? "COPIED!" : "COPY_LINK"}</span>
                        </button>

                        {/* Delete Asset */}
                        <button
                          onClick={() => handleDelete(asset.id, asset.filename)}
                          className="text-text-mute hover:text-red-500 p-1 hover:bg-red-500/5 rounded transition-all cursor-pointer"
                          title="Purge Asset"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="p-12 border border-dashed border-neutral-800 bg-neutral-950/25 rounded-large text-center space-y-3 font-mono text-[9px] text-text-mute uppercase">
              <FolderOpen className="w-6 h-6 text-gold/40 mx-auto" />
              <p>No media blueprints found matching filter criteria.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
