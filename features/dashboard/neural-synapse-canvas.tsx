"use client";

import React, { useEffect, useRef, useState } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  originalX?: number;
  originalY?: number;
}

export default function NeuralSynapseCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isReducedMotion, setIsReducedMotion] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    return false;
  });
  const nodesRef = useRef<Node[]>([]);
  const mouseRef = useRef<{ x: number | null; y: number | null }>({ x: null, y: null });

  // 1. Detect Accessibility Preferences (Reduced Motion)
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleMotionChange);
    return () => mediaQuery.removeEventListener("change", handleMotionChange);
  }, []);

  // 2. Responsive Design: Container-aware ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      
      // Debounce slightly or update instantly depending on canvas scale
      setDimensions({ width, height });
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // 3. Initialize Nodes once dimensions are verified
  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;

    const nodeCount = Math.min(22, Math.floor((dimensions.width * dimensions.height) / 32000) + 10);
    const nodes: Node[] = [];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 2 + 1.5,
      });
    }

    nodesRef.current = nodes;
  }, [dimensions]);

  // 4. Primary Animation Loop (HTML5 Canvas 2D)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0 || dimensions.height === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const render = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      const nodes = nodesRef.current;
      const mouse = mouseRef.current;

      // Draw Connection Links
      ctx.lineWidth = 0.5;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.hypot(dx, dy);

          // Connect nodes within 130px distance
          if (dist < 130) {
            const alpha = (1 - dist / 130) * 0.08;
            ctx.strokeStyle = `rgba(0, 112, 243, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw Cursor-to-Node Gravity Connections
      if (mouse.x !== null && mouse.y !== null && !isReducedMotion) {
        for (let i = 0; i < nodes.length; i++) {
          const dx = nodes[i].x - mouse.x;
          const dy = nodes[i].y - mouse.y;
          const dist = Math.hypot(dx, dy);

          if (dist < 180) {
            const alpha = (1 - dist / 180) * 0.15;
            ctx.strokeStyle = `rgba(0, 112, 243, ${alpha})`;
            ctx.lineWidth = 0.75;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();

            // Gentle gravity pull toward cursor
            const force = (180 - dist) * 0.0003;
            nodes[i].vx -= dx * force;
            nodes[i].vy -= dy * force;
          }
        }
      }

      // Render Nodes & Update Physics
      nodes.forEach((node) => {
        // Draw elegant glowing node
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 112, 243, 0.4)";
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = "#0070F3";
        ctx.fill();

        if (!isReducedMotion) {
          // Drift node mechanics
          node.x += node.vx;
          node.y += node.vy;

          // Damping to prevent perpetual speedup
          node.vx *= 0.98;
          node.vy *= 0.98;

          // Gentle ambient bounce noise
          node.vx += (Math.random() - 0.5) * 0.015;
          node.vy += (Math.random() - 0.5) * 0.015;

          // Bound checks
          if (node.x < 0) {
            node.x = 0;
            node.vx *= -1;
          } else if (node.x > dimensions.width) {
            node.x = dimensions.width;
            node.vx *= -1;
          }

          if (node.y < 0) {
            node.y = 0;
            node.vy *= -1;
          } else if (node.y > dimensions.height) {
            node.y = dimensions.height;
            node.vy *= -1;
          }
        }
      });

      if (!isReducedMotion) {
        animationId = requestAnimationFrame(render);
      }
    };

    if (isReducedMotion) {
      // Single draw for static blueprint fallback
      render();
    } else {
      render();
    }

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [dimensions, isReducedMotion]);

  // Handle cursor tracking coordinates
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isReducedMotion || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseLeave = () => {
    mouseRef.current = { x: null, y: null };
  };

  return (
    <div
      ref={containerRef}
      id="neural-synapse-canvas-container"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-auto"
    >
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="block w-full h-full opacity-60 mix-blend-multiply dark:mix-blend-screen"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
