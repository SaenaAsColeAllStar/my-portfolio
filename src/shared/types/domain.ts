/**
 * Cole.dev Core Domain Models.
 * Centralized, shared business entity contracts to prevent duplicate interfaces
 * across the application layer and feature domains.
 */

export interface Project {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string; // Raw markdown narrative
  role: string;
  duration: string;
  thumbnail?: string;
  tags: string[];
  links?: {
    github?: string;
    live?: string;
  };
  architectureTopology?: string; // Markdown or SVG representation of technical structure
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string; // Raw markdown body
  publishedAt: string;
  readTime: string;
  coverImage?: string;
  tags: string[];
}

export interface TimelineItem {
  id: string;
  title: string;
  role: string;
  company: string;
  location?: string;
  duration: string;
  description: string;
  achievements: string[];
  tags: string[];
  type: "work" | "education" | "project";
}
