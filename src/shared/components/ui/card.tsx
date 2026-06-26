"use client";

import React, { useRef, useState, type HTMLAttributes } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  glowEffect?: boolean;
  glowColor?: string;
}

/**
 * Premium Interactive Card Primitive.
 * Spotlight border glow effect that tracks cursor position.
 */
export const Card: React.FC<CardProps> = ({
  children,
  className,
  interactive = false,
  glowEffect = false,
  glowColor = "rgba(212, 175, 55, 0.12)",
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [hovered, setHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !glowEffect) return;

    const { left, top } = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  };

  const baseClasses = "relative overflow-hidden border border-border-mute bg-surface rounded-large shadow-premium-1 transition-all duration-300";
  const interactiveClasses = interactive
    ? "hover:border-border-strong hover:shadow-premium-2 hover:-translate-y-1 cursor-pointer"
    : "";
  
  const combinedClasses = twMerge(clsx(baseClasses, interactiveClasses, className));

  const glowBackground = useMotionTemplate`
    radial-gradient(
      350px circle at ${mouseX}px ${mouseY}px,
      ${glowColor},
      transparent 80%
    )
  `;

  const cardContent = (
    <>
      {glowEffect && (
        <motion.div
          className="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-300 z-0"
          style={{
            background: glowBackground,
            opacity: hovered ? 1 : 0,
          }}
        />
      )}
      <div className="relative z-10 w-full h-full">{children}</div>
    </>
  );

  return (
    <div
      ref={cardRef}
      className={combinedClasses}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      {...props}
    >
      {cardContent}
    </div>
  );
};

export default Card;
