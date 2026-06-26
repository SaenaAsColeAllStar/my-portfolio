"use client";

import React, { useEffect, useRef, useState, type ReactNode } from "react";
import { logger } from "../logger/logger";

export interface Canvas3DProps {
  mode?: "static" | "spline" | "three" | "rtf";
  sceneUrl?: string;
  fallbackImage?: string;
  className?: string;
  children?: ReactNode;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
  originalX: number;
  originalY: number;
  originalZ: number;
  color: string;
}

/**
 * 3D Engine Abstraction Canvas.
 * Decouples 3D visual physics rendering from page structures.
 * Automatically falls back to static vector blueprint grid when prefers-reduced-motion is active.
 * Houses a lightweight, high-fidelity 3D Knowledge Core projection to guarantee Lighthouse 100.
 */
export const Canvas3D: React.FC<Canvas3DProps> = ({
  mode = "static",
  sceneUrl,
  fallbackImage,
  className = "",
  children,
}) => {
  const [isClient, setIsClient] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [webGLSupported, setWebGLSupported] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<Point3D[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    setIsClient(true);

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(motionQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
      logger.info(`prefers-reduced-motion status changed: ${e.matches}`);
    };

    motionQuery.addEventListener("change", handleMotionChange);

    try {
      const canvas = document.createElement("canvas");
      const support = !!(
        window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
      );
      setWebGLSupported(support);
    } catch (e) {
      setWebGLSupported(false);
    }

    return () => {
      motionQuery.removeEventListener("change", handleMotionChange);
    };
  }, []);

  // Initialize 3D points forming a double-helix core / spherical brain network
  useEffect(() => {
    if (!isClient || prefersReducedMotion) return;

    const points: Point3D[] = [];
    const pointCount = 60;
    
    // Create a spherical shell interlaced with structured orbital rings (Knowledge Core)
    for (let i = 0; i < pointCount; i++) {
      let x = 0, y = 0, z = 0;
      let color = "rgba(212, 175, 55, 0.6)"; // Brand Gold
      
      if (i < 24) {
        // Core orbital ring 1 (Horizontal)
        const angle = (i / 24) * Math.PI * 2;
        x = Math.cos(angle) * 80;
        z = Math.sin(angle) * 80;
        y = (Math.random() - 0.5) * 10;
        color = "rgba(212, 175, 55, 0.75)";
      } else if (i < 48) {
        // Core orbital ring 2 (Vertical)
        const angle = ((i - 24) / 24) * Math.PI * 2;
        x = (Math.random() - 0.5) * 10;
        y = Math.cos(angle) * 80;
        z = Math.sin(angle) * 80;
        color = "rgba(0, 112, 243, 0.65)"; // Accent Blue
      } else {
        // Outer cognitive shell nodes
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        x = Math.sin(phi) * Math.cos(theta) * 110;
        y = Math.sin(phi) * Math.sin(theta) * 110;
        z = Math.cos(phi) * 110;
        color = Math.random() > 0.5 ? "rgba(212, 175, 55, 0.5)" : "rgba(255, 255, 255, 0.4)";
      }

      points.push({ x, y, z, originalX: x, originalY: y, originalZ: z, color });
    }

    pointsRef.current = points;
  }, [isClient, prefersReducedMotion]);

  // Primary 3D Perspective Projection Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isClient || prefersReducedMotion) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let angleX = 0.003; // Self-rotation speed
    let angleY = 0.004;

    const render = () => {
      if (!canvas || !ctx) return;
      
      const width = canvas.width = canvas.clientWidth;
      const height = canvas.height = canvas.clientHeight;
      const centerX = width / 2;
      const centerY = height / 2;
      const fov = 300; // Camera perspective field of view

      ctx.clearRect(0, 0, width, height);

      // Smoothly interpolate mouse tilt values
      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      // Base rotation speeds plus mouse influence
      const currentAngleX = angleX + mouse.y * 0.0005;
      const currentAngleY = angleY + mouse.x * 0.0005;

      const cosX = Math.cos(currentAngleX);
      const sinX = Math.sin(currentAngleX);
      const cosY = Math.cos(currentAngleY);
      const sinY = Math.sin(currentAngleY);

      const points = pointsRef.current;

      // 1. Rotate and Project Points
      const projected = points.map((p) => {
        // Rotate around Y axis
        let x1 = p.x * cosY - p.z * sinY;
        let z1 = p.z * cosY + p.x * sinY;

        // Rotate around X axis
        let y2 = p.y * cosX - z1 * sinX;
        let z2 = z1 * cosX + p.y * sinX;

        // Save rotated coordinates back
        p.x = x1;
        p.y = y2;
        p.z = z2;

        // 3D Perspective Projection
        const scale = fov / (fov + z2);
        const projX = x1 * scale + centerX;
        const projY = y2 * scale + centerY;

        return { x: projX, y: projY, z: z2, scale, color: p.color };
      });

      // 2. Draw Connection Blueprints (Grid Lines)
      ctx.lineWidth = 0.5;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const dx = projected[i].x - projected[j].x;
          const dy = projected[i].y - projected[j].y;
          const dist2D = Math.hypot(dx, dy);

          // Connect points within proximity (simulating neural nodes)
          if (dist2D < 90) {
            // Compute average 3D depth to shade line opacity
            const avgZ = (projected[i].z + projected[j].z) / 2;
            // Map depth to opacity: range from -110 to +110
            const depthFactor = Math.max(0, Math.min(1, (110 - avgZ) / 220));
            const opacity = (1 - dist2D / 90) * 0.18 * depthFactor;

            // Draw line blending to brand gold/blue
            ctx.strokeStyle = projected[i].color.includes("212")
              ? `rgba(212, 175, 55, ${opacity})`
              : `rgba(0, 112, 243, ${opacity})`;

            ctx.beginPath();
            ctx.moveTo(projected[i].x, projected[i].y);
            ctx.lineTo(projected[j].x, projected[j].y);
            ctx.stroke();
          }
        }
      }

      // 3. Render Projected Core Nodes
      projected.forEach((p) => {
        const depthFactor = Math.max(0.2, Math.min(1.4, (110 - p.z) / 220));
        const r = 2.5 * p.scale * depthFactor;

        // Glow halo
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace(/[\d\.]+\)$/, `${0.15 * depthFactor})`);
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace(/[\d\.]+\)$/, `${0.7 * depthFactor})`);
        ctx.fill();
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isClient, prefersReducedMotion]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    // Set target rotation angles proportional to cursor offset
    mouseRef.current.targetX = x * 0.15;
    mouseRef.current.targetY = y * 0.15;
  };

  const handleMouseLeave = () => {
    mouseRef.current.targetX = 0;
    mouseRef.current.targetY = 0;
  };

  // SSR or Static fallback when javascript is offline
  if (!isClient) {
    return (
      <div className={`relative flex items-center justify-center bg-transparent ${className}`}>
        {fallbackImage && (
          <img
            src={fallbackImage}
            alt="Technical Architecture Blueprint"
            className="w-full h-full object-contain opacity-40 select-none pointer-events-none"
          />
        )}
        {children}
      </div>
    );
  }

  const shouldFallback = prefersReducedMotion || !webGLSupported || mode === "static";

  if (shouldFallback) {
    logger.debug("Canvas3D: Rendering static visual blueprint.");
    return (
      <div className={`relative flex items-center justify-center bg-transparent ${className}`}>
        {fallbackImage ? (
          <img
            src={fallbackImage}
            alt="Technical Architecture Blueprint"
            className="w-full h-full object-contain opacity-40 select-none pointer-events-none transition-opacity duration-700"
          />
        ) : (
          <svg
            className="w-full h-full max-w-[340px] aspect-square opacity-30 text-[#111111] dark:text-white"
            fill="none"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            <circle cx="100" cy="100" r="45" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3,3" strokeOpacity="0.4" />
            <circle cx="100" cy="100" r="70" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1,4" strokeOpacity="0.2" />
            <line x1="10" y1="100" x2="190" y2="100" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.25" />
            <line x1="100" y1="10" x2="100" y2="190" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.25" />
          </svg>
        )}
        {children}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden cursor-crosshair bg-transparent ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full opacity-70 dark:opacity-85 mix-blend-multiply dark:mix-blend-screen"
      />
      {children}
    </div>
  );
};

export default Canvas3D;
