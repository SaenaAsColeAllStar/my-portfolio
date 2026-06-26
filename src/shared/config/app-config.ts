import { env } from "./env";

/**
 * Centralized Application Configuration.
 * Fully type-safe, environment-aware configuration boundaries.
 * Isolates static constants, feature toggles, and API metadata from business logic.
 */
export const appConfig = {
  app: {
    name: "Cole.dev",
    domain: env.NEXT_PUBLIC_APP_URL,
    developer: {
      name: "ColeAllStar",
      tagline: "AI Systems & Full Stack Architect",
      github: "https://github.com/SaenaAsColeAllStar",
      linkedin: "https://linkedin.com/in/coleallstar",
    },
  },
  
  api: {
    baseUrl: env.NEXT_PUBLIC_API_URL,
    timeoutMs: 8000,
    retryConfig: {
      maxAttempts: 3,
      backoffMs: 1000,
    },
  },

  cloudflare: {
    // Public Turnstile Site Key for captcha validation
    turnstileSiteKey: "0x4AAAAAAA-placeholder-key",
  },

  cms: {
    // Switch between 'local' and 'api' dynamically based on environment
    source: (process.env.NEXT_PUBLIC_CMS_SOURCE as "local" | "api") || "local",
    localCacheTtl: 3600, // 1 hour in seconds
  },

  ai: {
    chatEndpoint: "/api/gemini/chat",
    maxHistoryLength: 10, // Avoid context window saturation
    similarityThreshold: 0.62, // Hallucination guard bounds
  },

  observability: {
    logLevel: env.NODE_ENV === "production" ? "info" : "debug",
    enableMetrics: env.NODE_ENV === "production",
    enableTracing: env.NODE_ENV === "production",
  },

  featureFlags: {
    enableAiLab: env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_ENABLE_AI_LAB === "true",
    enableKonamiMode: true,
    enableExperimental3D: false,
  },

  seo: {
    defaultTitle: "Cole.dev — Lead AI Systems & Full Stack Architect",
    defaultDescription: "Portfolio showcasing high-performance edge-native AI systems, serverless software architectures, and technical editorial essays.",
    openGraph: {
      type: "website",
      siteName: "Cole.dev",
      images: [
        {
          url: `${env.NEXT_PUBLIC_APP_URL}/assets/og-cover.png`,
          width: 1200,
          height: 630,
          alt: "Cole.dev — Technical Drafting Board Blueprint",
        },
      ],
    },
  },
};

export default appConfig;
