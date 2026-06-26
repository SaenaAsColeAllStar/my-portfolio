"use client";

import React, { forwardRef, type ButtonHTMLAttributes } from "react";
import { motion } from "framer-motion";
import { useMagnetEffect } from "../../lib/motion/motion-tokens";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "glass" | "ghost";
  size?: "sm" | "md" | "lg";
  isMagnetic?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/**
 * Reusable Premium Button Primitive.
 * Features magnetic physics pull, glassmorphism, and responsive states.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = "secondary",
      size = "md",
      isMagnetic = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      ...props
    },
    ref
  ) => {
    const magnet = useMagnetEffect(0.2);
    const activeRef = (ref || magnet.ref) as React.RefObject<HTMLButtonElement | null>;

    const baseStyles = "relative inline-flex items-center justify-center font-medium tracking-tight transition-colors focus-visible:outline-2 focus-visible:outline-accent-gold focus-visible:outline-offset-2 disabled:opacity-40 disabled:pointer-events-none cursor-pointer";
    
    const variants = {
      primary: "bg-[#111111] hover:bg-black text-[#FAF9F6] border border-transparent dark:bg-white dark:hover:bg-[#ECECEC] dark:text-[#000000]",
      secondary: "bg-surface border border-border-mute text-foreground hover:bg-surface-alt hover:border-border-strong",
      glass: "glass-panel text-foreground hover:bg-surface-alt hover:border-border-strong",
      ghost: "bg-transparent text-foreground hover:bg-surface-alt hover:border-border-mute",
    };

    const sizes = {
      sm: "h-9 px-3.5 text-xs rounded-small gap-1.5",
      md: "h-11 px-5 text-sm rounded-medium gap-2",
      lg: "h-13 px-7 text-base rounded-large gap-2.5",
    };

    const combinedClasses = twMerge(
      clsx(baseStyles, variants[variant], sizes[size], className)
    );

    const content = (
      <>
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!isLoading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        <span className="truncate">{children}</span>
        {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </>
    );

    if (isMagnetic && !disabled) {
      return (
        <motion.button
          ref={activeRef}
          className={combinedClasses}
          disabled={disabled}
          style={magnet.style}
          whileTap={{ scale: 0.97 }}
          {...(props as any)}
        >
          {content}
        </motion.button>
      );
    }

    return (
      <button
        ref={activeRef}
        className={combinedClasses}
        disabled={disabled}
        {...props}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
