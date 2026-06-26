import { Cpu, Network, ShieldCheck } from "lucide-react";
import type { ComponentType } from "react";

export type ProjectSlug =
  | "distributed-cognitive-router"
  | "global-event-log-sync"
  | "boundary-shield-waf";

export type ArchitectureNodeType = "client" | "edge" | "cache" | "model" | "db" | "gateway";

export interface ProjectSummary {
  id: string;
  slug: ProjectSlug;
  category: string;
  title: string;
  description: string;
  latencyMetric: string;
  scaleMetric: string;
  techStack: string[];
  icon: ComponentType<{ className?: string }>;
  accentColor: string;
}

export interface ArchitectureNode {
  id: string;
  label: string;
  type: ArchitectureNodeType;
  description: string;
  details: string;
  latency: string;
  tech: string;
  x: number;
  y: number;
}

export interface ArchitectureLink {
  source: string;
  target: string;
}

export interface ProjectArchitecture {
  nodes: ArchitectureNode[];
  links: ArchitectureLink[];
}

export const DEFAULT_PROJECT_SLUG: ProjectSlug = "distributed-cognitive-router";

export const projectSummaries: ProjectSummary[] = [
  {
    id: "proj_1",
    slug: "distributed-cognitive-router",
    category: "AI Routing Systems",
    title: "Distributed Cognitive Semantic Router",
    description:
      "Sub-40ms serverless inference gateway performing in-context query classification and local vector pre-routing. Eliminates redundant LLM compute cycles by intercepting repeated patterns directly at the edge boundary.",
    latencyMetric: "38ms p95",
    scaleMetric: "92% compute saved",
    techStack: ["Cloudflare KV", "Gemini API", "Edge Isolates"],
    icon: Cpu,
    accentColor: "text-[#0070F3] bg-[#0070F3]/5 border-[#0070F3]/10 hover:shadow-[#0070F3]/5",
  },
  {
    id: "proj_2",
    slug: "global-event-log-sync",
    category: "Database Engineering",
    title: "Zero-Latency D1 Event Log Synchronizer",
    description:
      "Distributed SQLite transactional synchronization scheme. Manages real-time write consolidation and edge audit trails with strict eventual consistency, avoiding centralized database contention bottlenecks.",
    latencyMetric: "12ms Write Consolidation",
    scaleMetric: "1.2M logs/sec Peak",
    techStack: ["Cloudflare D1", "Drizzle ORM", "TypeScript"],
    icon: Network,
    accentColor: "text-amber-600 bg-amber-500/5 border-amber-500/10 hover:shadow-amber-500/5",
  },
  {
    id: "proj_3",
    slug: "boundary-shield-waf",
    category: "Security & WAF",
    title: "Boundary Shield Edge Firewall",
    description:
      "High-throughput serverless Web Application Firewall screening dynamic telemetry streams for nested SQL injection or payload contamination. Runs compiled Rust WASM binary decoders directly in the Cloudflare request pipeline.",
    latencyMetric: "1.8ms Overhead",
    scaleMetric: "99.99% accuracy",
    techStack: ["Rust WASM", "Cloudflare Workers", "RegEx Engines"],
    icon: ShieldCheck,
    accentColor: "text-purple-600 bg-purple-500/5 border-purple-500/10 hover:shadow-purple-500/5",
  },
];

export const projectArchitectures: Record<ProjectSlug, ProjectArchitecture> = {
  "distributed-cognitive-router": {
    nodes: [
      { id: "client", label: "User Request", type: "client", description: "Client browser edge handshake", details: "Initiates secure HTTPS payload containing model instruction query.", latency: "<1ms", tech: "Browser", x: 80, y: 250 },
      { id: "gateway", label: "Edge Gateway", type: "gateway", description: "Cloudflare Pages isolate middleware", details: "Intercepts request, parses headers, handles rate-limits and JWT telemetry verification.", latency: "4ms", tech: "Cloudflare Pages", x: 220, y: 250 },
      { id: "cache", label: "Global KV Cache", type: "cache", description: "Cloudflare KV semantic store", details: "Performs instant string hash comparison to fetch historical inference hits instantly.", latency: "12ms", tech: "Cloudflare KV", x: 220, y: 110 },
      { id: "classifier", label: "Semantic Classifier", type: "model", description: "Gemini 2.5 Flash Router", details: "Determines complex intents, filters out injection triggers, and maps queries to target pools.", latency: "22ms", tech: "Gemini 2.5 Flash", x: 380, y: 250 },
      { id: "targets", label: "Inference Targets", type: "model", description: "Optimized model routing pool", details: "Coordinates generation across Gemini 2.5 Pro or localized high-tier reasoning engines.", latency: "Varies", tech: "Multi-Model Pool", x: 520, y: 250 },
    ],
    links: [
      { source: "client", target: "gateway" },
      { source: "gateway", target: "cache" },
      { source: "gateway", target: "classifier" },
      { source: "classifier", target: "targets" },
    ],
  },
  "global-event-log-sync": {
    nodes: [
      { id: "worker", label: "Edge Writer", type: "edge", description: "Distributed background writer", details: "Captures transactional event logs from localized edge isolate runtimes.", latency: "2ms", tech: "Pages Function", x: 80, y: 250 },
      { id: "queue", label: "Consolidation Queue", type: "gateway", description: "D1 write coordination queue", details: "Batches, schedules, and serializes incoming writes to avoid central lockouts.", latency: "8ms", tech: "Workers KV Queue", x: 220, y: 250 },
      { id: "d1", label: "D1 SQL Engine", type: "db", description: "Cloudflare D1 SQLite database", details: "Strict transactional database engine syncing distributed relational records.", latency: "15ms", tech: "Cloudflare D1", x: 380, y: 250 },
      { id: "drizzle", label: "Drizzle Schema", type: "cache", description: "Fully type-safe ORM mapping Layer", details: "Compiles relational models, enforcing SQL consistency and foreign key constraints.", latency: "<1ms", tech: "Drizzle ORM", x: 380, y: 110 },
      { id: "audit", label: "Audit Console", type: "client", description: "Real-time log console", details: "Visualizes live database synchronizations and transactional telemetry streams.", latency: "<10ms", tech: "React Context", x: 520, y: 250 },
    ],
    links: [
      { source: "worker", target: "queue" },
      { source: "queue", target: "d1" },
      { source: "d1", target: "drizzle" },
      { source: "d1", target: "audit" },
    ],
  },
  "boundary-shield-waf": {
    nodes: [
      { id: "client", label: "Sender Payload", type: "client", description: "Inbound request stream", details: "Carries encrypted body and metadata parameter headers from external client.", latency: "<1ms", tech: "HTTPS Payload", x: 80, y: 250 },
      { id: "shield", label: "Filter Gate", type: "gateway", description: "Boundary Shield WAF proxy", details: "Validates payload lengths, decodes base64 signatures, and tracks rate limits.", latency: "0.6ms", tech: "Cloudflare Edge", x: 220, y: 250 },
      { id: "wasm", label: "Rust WASM Core", type: "edge", description: "High-performance WASM decoder", details: "Executes strict Rust binary filters to parse nested parameters at memory safety level.", latency: "1.2ms", tech: "Compiled Rust WASM", x: 380, y: 140 },
      { id: "regex", label: "Regex Engine", type: "cache", description: "Compiled signature matchers", details: "Compares telemetry parameters against real-time database of SQL injection signatures.", latency: "0.8ms", tech: "Optimized RegExp", x: 380, y: 360 },
      { id: "response", label: "Shield Decision", type: "model", description: "Sanitized block or pass action", details: "Returns immediate block payload error or forwards sanitary data onward.", latency: "0.2ms", tech: "WAF Decision", x: 520, y: 250 },
    ],
    links: [
      { source: "client", target: "shield" },
      { source: "shield", target: "wasm" },
      { source: "shield", target: "regex" },
      { source: "wasm", target: "response" },
      { source: "regex", target: "response" },
    ],
  },
};

export function isProjectSlug(value: string | null): value is ProjectSlug {
  return Boolean(value && value in projectArchitectures);
}

export function getProjectArchitecture(slug: string): ProjectArchitecture {
  return projectArchitectures[isProjectSlug(slug) ? slug : DEFAULT_PROJECT_SLUG];
}
