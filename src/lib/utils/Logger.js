// T023: Logging utilities with environment detection

/**
 * Determine whether the code is running in development mode.
 *
 * Checks the Chrome extension manifest's `update_url` to infer production vs development;
 * if the manifest is unavailable or an error occurs, defaults to development mode.
 * @returns {boolean} `true` if running in development mode, `false` otherwise.
 */
function isDevelopment() {
  // In Chrome Extension, development mode has no update_url in manifest
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getManifest) {
      const manifest = chrome.runtime.getManifest();
      return !manifest.update_url;
    }
  } catch (error) {
    // Fallback: assume development if error
    return true;
  }
  return true;
}

/**
 * Log an informational message when running in development mode.
 * @param {string} message - The message to log.
 * @param {*} [data] - Optional additional data to include with the message.
 */
export function logInfo(message, data) {
  if (isDevelopment()) {
    if (data !== undefined) {
      console.log(`[ScopeShield] ${message}`, data);
    } else {
      console.log(`[ScopeShield] ${message}`);
    }
  }
}

/**
 * Log an error with a standardized "[ScopeShield ERROR]" prefix and include stack information when available.
 *
 * If `error` is an `Error` instance, `error.message` and `error.stack` are included; otherwise the `error` value is logged as provided.
 * @param {string} message - Human-readable context message describing the error.
 * @param {Error|*} error - An `Error` instance or any value containing error details.
 */
export function logError(message, error) {
  if (error instanceof Error) {
    console.error(`[ScopeShield ERROR] ${message}`, error.message, error.stack);
  } else {
    console.error(`[ScopeShield ERROR] ${message}`, error);
  }
}

/**
 * Log a performance metric when running in development mode.
 *
 * The message is written to the console with a "[ScopeShield PERF]" prefix and includes
 * the operation name and the duration formatted to two decimal places followed by "ms".
 *
 * @param {string} operation - Name of the operation being measured.
 * @param {number} duration - Elapsed time in milliseconds.
 */
export function logPerformance(operation, duration) {
  if (isDevelopment()) {
    console.log(`[ScopeShield PERF] ${operation}: ${duration.toFixed(2)}ms`);
  }
}

/**
 * Log a warning message with an optional data payload.
 * @param {string} message - Warning text to log.
 * @param {*} [data] - Optional value to include alongside the warning.
 */
export function logWarning(message, data) {
  if (data !== undefined) {
    console.warn(`[ScopeShield WARNING] ${message}`, data);
  } else {
    console.warn(`[ScopeShield WARNING] ${message}`);
  }
}