// Text Export Service
// Handles downloading change orders as .txt files

import { logInfo, logError } from '../../utils/Logger.js';

/**
 * Download text as a .txt file
 * @param {string} text - Text content to download
 * @param {Object} metadata - File metadata
 * @param {string} metadata.clientName - Client name for filename
 * @param {string} metadata.date - Date for filename (YYYY-MM-DD)
 * @returns {{success: boolean, error?: string}}
 */
export function downloadAsText(text, metadata = {}) {
  const startTime = performance.now();

  try {
    // Validate input
    if (!text || typeof text !== 'string') {
      return {
        success: false,
        error: 'Invalid text provided for download'
      };
    }

    // Generate filename
    const filename = generateFilename(metadata);

    // Create blob
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;

    // Trigger download
    link.click();

    // Cleanup
    URL.revokeObjectURL(url);

    const duration = performance.now() - startTime;
    logInfo(`TextExport: Downloaded ${text.length} chars as "${filename}" in ${duration.toFixed(2)}ms`);

    return { success: true };

  } catch (error) {
    const duration = performance.now() - startTime;
    logError(`TextExport: Failed after ${duration.toFixed(2)}ms`, error);

    return {
      success: false,
      error: `Failed to download text file: ${error.message}`
    };
  }
}

/**
 * Generate safe filename for text download
 * @param {Object} metadata - File metadata
 * @returns {string} Sanitized filename
 * @private
 */
function generateFilename(metadata) {
  const { clientName = 'Client', date } = metadata;

  // Sanitize client name (remove unsafe characters)
  // First limit length, then remove unsafe chars
  const truncated = clientName.slice(0, 50);
  const safeClientName = truncated
    .replace(/[^a-zA-Z0-9-_\s]/g, '_') // Replace unsafe chars with underscore
    .replace(/\s+/g, '_')               // Replace spaces with underscore
    .replace(/_{2,}/g, '_')             // Collapse multiple underscores
    .replace(/^_|_$/g, '');              // Trim underscores

  // Format date
  const safeDate = date || new Date().toISOString().split('T')[0];

  return `ChangeOrder_${safeClientName}_${safeDate}.txt`;
}

/**
 * Get expected filename for testing/preview
 * @param {Object} metadata - File metadata
 * @returns {string}
 */
export function getFilename(metadata) {
  return generateFilename(metadata);
}
