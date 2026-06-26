"use client";

import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { logger } from "../../lib/logger/logger";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Global React Error Boundary component.
 * Catches UI crashes, logs them, and displays a premium technical fallback page.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error("React Error Boundary caught a crash:", error, {
      componentStack: errorInfo.componentStack,
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAF9F6] p-6 text-center dark:bg-[#0B0B0B]">
          <div className="w-full max-w-md border border-[rgba(17,17,16,0.08)] bg-white p-8 rounded-xl shadow-[0_4px_24px_-4px_rgba(0,0,0,0.03)] dark:border-[rgba(255,255,255,0.05)] dark:bg-[#121212]">
            <div className="mb-6 flex justify-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400">
                ⚠️
              </span>
            </div>
            <h2 className="mb-2 text-xl font-medium tracking-tight text-[#111111] dark:text-[#FFFFFF]">
              System Encountered an Anomaly
            </h2>
            <p className="mb-6 text-sm text-[#6B6A65] dark:text-slate-400">
              An unexpected rendering fault has occurred. Telemetry reports have been filed.
            </p>
            <button
              onClick={this.handleReset}
              className="w-full py-2.5 px-4 bg-[#111111] hover:bg-black text-[#FAF9F6] font-medium text-sm rounded-lg transition-colors cursor-pointer dark:bg-[#FFFFFF] dark:hover:bg-[#ECECEC] dark:text-[#0B0B0B]"
            >
              Initialize System Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
