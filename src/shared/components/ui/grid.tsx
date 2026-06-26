import React, { type HTMLAttributes } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  columns?: 4 | 8 | 12 | 16 | "auto";
  background?: "none" | "dots" | "blueprint";
  gap?: "sm" | "md" | "lg" | "none";
}

/**
 * Custom Engineering Grid Component.
 */
export const Grid: React.FC<GridProps> = ({
  children,
  className,
  columns = 12,
  background = "none",
  gap = "md",
  ...props
}) => {
  const columnClasses = {
    4: "grid-cols-4",
    8: "grid-cols-4 md:grid-cols-8",
    12: "grid-cols-4 md:grid-cols-8 xl:grid-cols-12",
    16: "grid-cols-4 md:grid-cols-8 xl:grid-cols-12 2xl:grid-cols-16",
    auto: "grid-cols-none auto-cols-max",
  };

  const backgroundClasses = {
    none: "",
    dots: "canvas-dot-matrix",
    blueprint: "blueprint-grid-canvas",
  };

  const gapClasses = {
    none: "gap-0",
    sm: "gap-4",
    md: "gap-grid-gap",
    lg: "gap-8",
  };

  const baseClasses = "relative w-full grid";
  
  const combinedClasses = twMerge(
    clsx(
      baseClasses,
      columnClasses[columns === "auto" ? "auto" : (columns as 4 | 8 | 12 | 16)],
      backgroundClasses[background],
      gapClasses[gap],
      className
    )
  );

  return (
    <div className={combinedClasses} {...props}>
      {children}
    </div>
  );
};

export default Grid;
