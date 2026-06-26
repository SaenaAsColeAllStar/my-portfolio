import React, { type HTMLAttributes } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface TerminalProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  lines?: string[];
  showControls?: boolean;
}

/**
 * Premium Technical Terminal UI Primitive.
 */
export const Terminal: React.FC<TerminalProps> = ({
  children,
  className,
  title = "bash",
  lines = [],
  showControls = true,
  ...props
}) => {
  const baseClasses = "obsidian-code-window w-full font-mono text-code-mono text-[#111111] dark:text-[#FFFFFF] bg-[#FAF9F6] dark:bg-[#0A0A0A] border border-border-strong rounded-large shadow-premium-2 overflow-hidden";
  const combinedClasses = twMerge(clsx(baseClasses, className));

  return (
    <div className={combinedClasses} {...props}>
      <div className="flex items-center justify-between h-9 px-4 bg-[#F2F1EC] dark:bg-[#121212] border-bottom border-border-mute">
        <div className="flex items-center gap-6">
          {showControls && (
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-400/30 border border-red-500/20 dark:bg-red-500/30" />
              <span className="w-3 h-3 rounded-full bg-yellow-400/30 border border-yellow-500/20 dark:bg-yellow-500/30" />
              <span className="w-3 h-3 rounded-full bg-green-400/30 border border-green-500/20 dark:bg-green-500/30" />
            </div>
          )}
          <span className="text-[11px] text-text-mute dark:text-slate-400 font-mono tracking-wide">
            {title}
          </span>
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-accent-gold opacity-30 animate-pulse" />
      </div>

      <div className="p-5 overflow-x-auto max-h-[350px] scrollbar-thin">
        {lines.length > 0 ? (
          <div className="flex flex-col gap-1.5 text-xs font-mono leading-relaxed">
            {lines.map((line, idx) => (
              <div key={idx} className="flex gap-4">
                <span className="text-text-tech dark:text-slate-600 w-5 text-right select-none opacity-40">
                  {idx + 1}
                </span>
                <span className="flex-1 whitespace-pre">{line}</span>
              </div>
            ))}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export default Terminal;
