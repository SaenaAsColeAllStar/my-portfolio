"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Premium spring and transition configuration tokens.
 * Calibrated to mimic Raycast, Linear, and Apple UI physics loops.
 */
export const motionTokens = {
  springs: {
    snappy: {
      type: "spring",
      stiffness: 400,
      damping: 28,
      mass: 0.8,
    },
    fluid: {
      type: "spring",
      stiffness: 280,
      damping: 30,
      mass: 1,
    },
    slow: {
      type: "spring",
      stiffness: 120,
      damping: 22,
      mass: 1.2,
    },
  },
  eases: {
    standard: [0.16, 1, 0.3, 1], // easeOutExpo
    smoothInOut: [0.65, 0, 0.35, 1],
  },
  timings: {
    instant: 0.1,
    fast: 0.2,
    medium: 0.4,
    slow: 0.7,
  },
};

/**
 * Reusable Framer Motion animation variants.
 */
export const motionPresets = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: motionTokens.timings.medium, ease: motionTokens.eases.standard },
  },
  
  reveal: {
    initial: { opacity: 0, y: 20 },
    animate: (customDelay = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: motionTokens.timings.slow,
        ease: motionTokens.eases.standard,
        delay: customDelay,
      },
    }),
  },

  lift: {
    initial: { scale: 1, y: 0 },
    hover: {
      scale: 1.015,
      y: -4,
      transition: { duration: motionTokens.timings.fast, ease: motionTokens.eases.standard },
    },
  },

  slide: (direction: "left" | "right" | "up" | "down" = "up") => {
    const directions = {
      left: { x: -30, y: 0 },
      right: { x: 30, y: 0 },
      up: { x: 0, y: 30 },
      down: { x: 0, y: -30 },
    };
    return {
      initial: { opacity: 0, ...directions[direction] },
      animate: {
        opacity: 1,
        x: 0,
        y: 0,
        transition: { duration: motionTokens.timings.medium, ease: motionTokens.eases.standard },
      },
      exit: {
        opacity: 0,
        ...directions[direction],
        transition: { duration: motionTokens.timings.fast, ease: motionTokens.eases.smoothInOut },
      },
    };
  },

  stagger: {
    animate: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  },
};

/**
 * Hook to track client-side mouse position.
 */
export function useMousePosition() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    let frameId: number;
    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      currentX = e.clientX;
      currentY = e.clientY;
    };

    const updatePosition = () => {
      setMousePos({ x: currentX, y: currentY });
      frameId = requestAnimationFrame(updatePosition);
    };

    window.addEventListener("mousemove", handleMouseMove);
    frameId = requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return mousePos;
}

/**
 * Hook to create a physical "magnetic pull" micro-interaction.
 */
export function useMagnetEffect(strength = 0.25) {
  const elementRef = useRef<HTMLElement | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const elCenterX = rect.left + rect.width / 2;
      const elCenterY = rect.top + rect.height / 2;

      const distanceX = e.clientX - elCenterX;
      const distanceY = e.clientY - elCenterY;

      const threshold = 100;
      const distance = Math.hypot(distanceX, distanceY);

      if (distance < threshold) {
        const pullX = distanceX * strength;
        const pullY = distanceY * strength;
        setOffset({ x: pullX, y: pullY });
      } else {
        setOffset({ x: 0, y: 0 });
      }
    };

    const handleMouseLeave = () => {
      setOffset({ x: 0, y: 0 });
    };

    window.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (el) {
        el.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, [strength]);

  return { ref: elementRef, offset, style: { transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` } };
}

/**
 * Hook to calculate high-performance parallax translation vectors based on cursor position.
 */
export function useParallaxVector(depth = 0.05) {
  const [vector, setVector] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let frameId: number;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      targetX = (e.clientX - centerX) * depth;
      targetY = (e.clientY - centerY) * depth;
    };

    const updateInterpolatedVector = () => {
      const lerpFactor = 0.08;
      currentX += (targetX - currentX) * lerpFactor;
      currentY += (targetY - currentY) * lerpFactor;

      setVector({ x: currentX, y: currentY });
      frameId = requestAnimationFrame(updateInterpolatedVector);
    };

    window.addEventListener("mousemove", handleMouseMove);
    frameId = requestAnimationFrame(updateInterpolatedVector);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(frameId);
    };
  }, [depth]);

  return vector;
}

export default motionTokens;
