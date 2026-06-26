import React, { type HTMLAttributes } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  intensity?: "low" | "medium" | "high";
  interactive?: boolean;
}

/**
 * Premium Glass Panel Primitive.
 */
export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  className,
  intensity = "medium",
  interactive = false,
  ...props
}) => {
  const intensities = {
    low: "bg-background/40 backdrop-blur-sm border-border-mute/50",
    medium: "bg-background/60 backdrop-blur-md border-border-mute",
    high: "bg-background/85 backdrop-blur-xl border-border-strong",
  };

  const baseClasses = "relative rounded-large border shadow-premium-1 transition-all duration-300";
  const interactiveClasses = interactive
    ? "hover:border-border-strong hover:shadow-premium-2 hover:-translate-y-0.5 cursor-pointer"
    : "";

  const combinedClasses = twMerge(
    clsx(baseClasses, intensities[intensity], interactiveClasses, className)
  );

  return (
    <div className={combinedClasses} {...props}>
      {children}
    </div>
  );
};

export default GlassPanel;
