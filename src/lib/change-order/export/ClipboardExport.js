// Clipboard Export Service
// Handles copying text to system clipboard with permission handling

import { logInfo, logError } from '../../utils/Logger.js';

/**
 * Copy text to system clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function copyToClipboard(text) {
  const startTime = performance.now();

  try {
    // Validate input
    if (!text || typeof text !== 'string') {
      return {
        success: false,
        error: 'Invalid text provided for clipboard copy'
      };
    }

    // Check if clipboard API is available
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      return {
        success: false,
        error: 'Clipboard API not available in this browser'
      };
    }

    // Attempt to write to clipboard
    await navigator.clipboard.writeText(text);

    const duration = performance.now() - startTime;
    logInfo(`ClipboardExport: Successfully copied ${text.length} chars in ${duration.toFixed(2)}ms`);

    // Warn if exceeds performance target (500ms)
    if (duration > 500) {
      logError(`ClipboardExport: Performance warning - copy took ${duration.toFixed(2)}ms (target <500ms)`, new Error('Performance threshold exceeded'));
    }

    return { success: true };

  } catch (error) {
    const duration = performance.now() - startTime;
    logError(`ClipboardExport: Failed after ${duration.toFixed(2)}ms`, error);

    // Determine error type and provide helpful message
    let errorMessage = 'Failed to copy to clipboard';

    if (error.name === 'NotAllowedError') {
      errorMessage = 'Clipboard access denied. Please grant permission or select and copy manually.';
    } else if (error.name === 'SecurityError') {
      errorMessage = 'Clipboard access blocked by browser security policy.';
    } else if (error.message) {
      errorMessage = `Clipboard error: ${error.message}`;
    }

    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Check if clipboard API is available
 * @returns {boolean}
 */
export function isClipboardAvailable() {
  return !!(navigator.clipboard && navigator.clipboard.writeText);
}
