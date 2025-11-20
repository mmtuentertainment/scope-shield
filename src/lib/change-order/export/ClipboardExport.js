// Clipboard Export Service
// Handles copying text to system clipboard with permission handling

import { logInfo, logError, logWarning } from '../../utils/Logger.js';

/**
 * Copy text to system clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<{success: boolean, error?: string, fallbackSuggestion?: string, needsManualCopy?: boolean}>}
 */
export async function copyToClipboard(text) {
  const startTime = performance.now();

  try {
    // Validate input (CodeRabbit: Uniform result shape)
    if (!text || typeof text !== 'string') {
      return {
        success: false,
        error: 'Invalid text provided for clipboard copy',
        fallbackSuggestion: 'Use "Download as Text" instead',
        needsManualCopy: false
      };
    }

    // Check if clipboard API is available
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      return {
        success: false,
        error: 'Clipboard API not available in this browser',
        fallbackSuggestion: 'Use "Select All" button to manually copy text',
        needsManualCopy: true
      };
    }

    // Attempt to write to clipboard
    await navigator.clipboard.writeText(text);

    const duration = performance.now() - startTime;
    logInfo(`ClipboardExport: Successfully copied ${text.length} chars in ${duration.toFixed(2)}ms`);

    // Warn if exceeds performance target (500ms)
    if (duration > 500) {
      logWarning(`ClipboardExport: Performance warning - copy took ${duration.toFixed(2)}ms (target <500ms)`);
    }

    return { success: true };

  } catch (error) {
    // Phase 8 (T270-T274): Enhanced clipboard permission error handling
    const duration = performance.now() - startTime;
    logError(`ClipboardExport: Failed after ${duration.toFixed(2)}ms`, error);

    // Determine error type and provide helpful message with fallback
    let errorMessage = 'Failed to copy to clipboard';
    let fallbackSuggestion = 'Try using "Download as Text" instead';
    let needsManualCopy = false;

    if (error.name === 'NotAllowedError') {
      errorMessage = 'Clipboard access denied';
      fallbackSuggestion = 'Click "Select All" below, then press Ctrl+C to copy';
      needsManualCopy = true; // Trigger SelectAllButton display
    } else if (error.name === 'SecurityError') {
      errorMessage = 'Clipboard blocked by browser security policy';
      fallbackSuggestion = 'Use "Select All" button and manual copy (Ctrl+C)';
      needsManualCopy = true;
    } else if (error.message) {
      errorMessage = `Clipboard error: ${error.message}`;
      fallbackSuggestion = 'Use "Download as Text" for alternative export';
    }

    return {
      success: false,
      error: errorMessage,
      fallbackSuggestion,
      needsManualCopy
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
