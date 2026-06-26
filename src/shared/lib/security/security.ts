import { apiClient } from "../api/api-client";
import { telemetry } from "../observability/observability-platform";
import type { ISecurityProvider } from "../../types/platform";

/**
 * Security Boundary Platform Service.
 * Implements the ISecurityProvider contract to manage XSS sanitization,
 * Cloudflare Turnstile token validation, and CSP/CORS header configurations.
 */
export class SecurityProvider implements ISecurityProvider {
  /**
   * Validates a Cloudflare Turnstile token against the backend verification gateway.
   */
  async validateTurnstileToken(token: string): Promise<boolean> {
    if (!token) {
      telemetry.warn("Security: Turnstile token validation skipped due to empty token.");
      return false;
    }

    try {
      telemetry.debug("Security: Initiating Turnstile token verification");
      const result = await apiClient
        .post<{ success: boolean }>("/api/security/turnstile", { token })
        .executeData();
      return result.success;
    } catch (err) {
      telemetry.error("Security: Turnstile token verification encountered a fault", err);
      return false;
    }
  }

  /**
   * Performs lightweight, edge-safe HTML sanitization to mitigate XSS injections
   * without requiring heavy DOM-bound libraries like DOMPurify in edge isolates.
   */
  sanitizeHtml(dirty: string): string {
    if (!dirty) return "";
    
    // Remove scripts, styles, iframes, and on-event attributes
    return dirty
      .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "")
      .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, "")
      .replace(/<iframe[^>]*>([\s\S]*?)<\/iframe>/gi, "")
      .replace(/on\w+="[^"]*"/g, "")
      .replace(/on\w+='[^']*'/g, "")
      .replace(/javascript:[^"']*/g, "");
  }

  /**
   * Generates strict, production-grade Content Security Policy (CSP) headers.
   */
  getCspHeaders(): Record<string, string> {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https://images.unsplash.com https://api.coleallstar.web.id",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://api.coleallstar.web.id https://challenges.cloudflare.com",
      "frame-src 'self' https://challenges.cloudflare.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ];

    return {
      "Content-Security-Policy": csp.join("; "),
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    };
  }

  /**
   * Exposes standard safe CORS configuration headers.
   */
  getCorsConfig(): Record<string, string> {
    return {
      "Access-Control-Allow-Origin": "https://coleallstar.web.id",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Cole-Client",
      "Access-Control-Max-Age": "86400",
    };
  }
}

export const securityProvider = new SecurityProvider();
export default securityProvider;
