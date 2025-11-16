// Text Export Service
// Handles downloading change orders as .txt files

import { logInfo, logError } from '../../utils/Logger.js';
import { generateChangeOrderFilename } from './FilenameUtils.js';

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
    const filename = generateChangeOrderFilename(metadata, 'txt');

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
 * Get expected filename for testing/preview
 * @param {Object} metadata - File metadata
 * @returns {string}
 */
export function getFilename(metadata) {
  return generateChangeOrderFilename(metadata, 'txt');
}
