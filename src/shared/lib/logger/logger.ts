import { telemetry } from "../observability/observability-platform";

/**
 * Backward-compatible logger wrapper.
 * Re-exports the unified, vendor-agnostic observability platform telemetry.
 */
export const logger = telemetry;
export default logger;
