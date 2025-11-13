// T023: Logging utilities with environment detection

/**
 * Check if running in development mode
 * @returns {boolean} True if development
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
 * Log informational message (development only)
 * @param {string} message - Message to log
 * @param {*} data - Optional data to log
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
 * Log error message (always logged)
 * @param {string} message - Error message
 * @param {Error|*} error - Error object or details
 */
export function logError(message, error) {
  if (error instanceof Error) {
    console.error(`[ScopeShield ERROR] ${message}`, error.message, error.stack);
  } else {
    console.error(`[ScopeShield ERROR] ${message}`, error);
  }
}

/**
 * Log performance metric (development only)
 * @param {string} operation - Operation name
 * @param {number} duration - Duration in milliseconds
 */
export function logPerformance(operation, duration) {
  if (isDevelopment()) {
    console.log(`[ScopeShield PERF] ${operation}: ${duration.toFixed(2)}ms`);
  }
}

/**
 * Log warning message (always logged)
 * @param {string} message - Warning message
 * @param {*} data - Optional data
 */
export function logWarning(message, data) {
  if (data !== undefined) {
    console.warn(`[ScopeShield WARNING] ${message}`, data);
  } else {
    console.warn(`[ScopeShield WARNING] ${message}`);
  }
}
