/**
 * Lightweight, zero-dependency environment variable validator.
 * Ensures that all required parameters for API and App connection are compliant at runtime.
 */
interface EnvVariables {
  NEXT_PUBLIC_API_URL: string;
  NEXT_PUBLIC_APP_URL: string;
  NODE_ENV: "development" | "production" | "test";
}

const parseEnv = (): EnvVariables => {
  const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.coleallstar.web.id";
  const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://coleallstar.web.id";
  const NODE_ENV = (process.env.NODE_ENV as any) || "development";

  // Light validation
  if (NEXT_PUBLIC_API_URL && !NEXT_PUBLIC_API_URL.startsWith("http")) {
    console.error("❌ Invalid env: NEXT_PUBLIC_API_URL must be a valid URL.");
    throw new Error("Invalid NEXT_PUBLIC_API_URL configuration.");
  }

  if (NEXT_PUBLIC_APP_URL && !NEXT_PUBLIC_APP_URL.startsWith("http")) {
    console.error("❌ Invalid env: NEXT_PUBLIC_APP_URL must be a valid URL.");
    throw new Error("Invalid NEXT_PUBLIC_APP_URL configuration.");
  }

  return {
    NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_URL,
    NODE_ENV,
  };
};

export const env = parseEnv();
export default env;
