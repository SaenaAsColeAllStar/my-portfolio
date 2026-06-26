import { logger } from "../logger/logger";

/**
 * Base custom error class for the application.
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly status?: number;

  constructor(message: string, code = "INTERNAL_ERROR", status?: number) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.status = status;
    
    // Fallback if captureStackTrace is not supported (e.g. in some edge runtimes)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Specific error class for API client network or response failures.
 */
export class APIError extends AppError {
  constructor(message: string, status?: number, details?: any) {
    super(message, "API_FAILURE", status);
    if (details) {
      (this as any).details = details;
    }
  }
}

/**
 * Specific error class for Virtual Cole AI stream failures.
 */
export class AIError extends AppError {
  constructor(message: string, details?: any) {
    super(message, "AI_ASSISTANT_FAILURE");
    if (details) {
      (this as any).details = details;
    }
  }
}

/**
 * Specific error class for CMS collection loading or parsing failures.
 */
export class CMSError extends AppError {
  constructor(message: string, details?: any) {
    super(message, "CMS_LOAD_FAILURE");
    if (details) {
      (this as any).details = details;
    }
  }
}

/**
 * Centralized error handler to log errors and map them to user-friendly states.
 */
export function handleError(error: unknown): {
  message: string;
  code: string;
  status: number;
} {
  if (error instanceof AppError) {
    logger.error(`AppError [${error.code}]: ${error.message}`, error);
    return {
      message: error.message,
      code: error.code,
      status: error.status || 500,
    };
  }

  if (error instanceof Error) {
    logger.error(`Unhandled Error: ${error.message}`, error);
    return {
      message: "An unexpected system error occurred. Please try again later.",
      code: "UNEXPECTED_ERROR",
      status: 500,
    };
  }

  logger.error("Unknown error caught", error);
  return {
    message: "An unknown error occurred.",
    code: "UNKNOWN_ERROR",
    status: 500,
  };
}
