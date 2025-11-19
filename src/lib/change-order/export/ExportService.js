// Export Service Orchestrator
// Routes export requests to appropriate export method

import { copyToClipboard, isClipboardAvailable } from './ClipboardExport.js';
import { downloadPDF } from './PDFGenerator.js';
import { downloadAsText } from './TextExport.js';
import { logInfo, logError, logWarning } from '../../utils/Logger.js';
import { ExportHistoryStorage } from '../../storage/ExportHistoryStorage.js';
import { DraftStorage } from '../DraftStorage.js';

/**
 * Export methods
 * @enum {string}
 */
export const ExportMethod = {
  CLIPBOARD: 'clipboard',
  PDF: 'pdf',
  TEXT: 'text'
};

/**
 * Export Service
 * Orchestrates all export operations
 */
export class ExportService {
  /**
   * Export change order using specified method
   * @param {string} text - Change order text
   * @param {string} method - Export method ('clipboard', 'pdf', 'text')
   * @param {Object} metadata - Export metadata
   * @returns {Promise<{success: boolean, error?: string, fallbackSuggestion?: string}>}
   */
  static async export(text, method, metadata = {}) {
    const startTime = performance.now();

    try {
      // Validate input
      if (!text || typeof text !== 'string') {
        return {
          success: false,
          error: 'Invalid text provided for export'
        };
      }

      if (!Object.values(ExportMethod).includes(method)) {
        return {
          success: false,
          error: `Invalid export method: ${method}. Use 'clipboard', 'pdf', or 'text'.`
        };
      }

      logInfo(`ExportService: Starting ${method} export...`);

      let result;

      // Route to appropriate export method
      switch (method) {
        case ExportMethod.CLIPBOARD:
          result = await this.copyToClipboard(text);
          break;

        case ExportMethod.PDF:
          result = await this.exportAsPDF(text, metadata);
          break;

        case ExportMethod.TEXT:
          result = this.downloadAsText(text, metadata);
          break;
      }

      const duration = performance.now() - startTime;
      if (result.success) {
        logInfo(`ExportService: ${method} export succeeded in ${duration.toFixed(2)}ms`);

        // Save to export history (fire-and-forget)
        ExportHistoryStorage.save({
          method,
          metadata,
          duration
        }).catch(err => {
          logWarning('Failed to save export history', err);
        });

        // Delete draft after successful export (fire-and-forget)
        DraftStorage.delete().catch(err => {
          logWarning('Failed to delete draft after export', err);
        });
      } else {
        logError(`ExportService: ${method} export failed after ${duration.toFixed(2)}ms`, new Error(result.error));
      }

      return result;

    } catch (error) {
      const duration = performance.now() - startTime;
      logError(`ExportService: Unexpected error after ${duration.toFixed(2)}ms`, error);

      return {
        success: false,
        error: `Export failed: ${error.message}`
      };
    }
  }

  /**
   * Copy to clipboard
   * @param {string} text - Text to copy
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  static async copyToClipboard(text) {
    // Check if clipboard is available
    if (!isClipboardAvailable()) {
      return {
        success: false,
        error: 'Clipboard API not available in this browser',
        fallbackSuggestion: 'Use "Download as Text" instead'
      };
    }

    return await copyToClipboard(text);
  }

  /**
   * Export as PDF
   * @param {string} text - Text to export
   * @param {Object} metadata - PDF metadata
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  static async exportAsPDF(text, metadata) {
    try {
      const result = await downloadPDF(text, metadata);

      // If PDF fails, suggest text fallback
      if (!result.success) {
        return {
          success: false,
          error: result.error,
          fallbackSuggestion: 'Try "Download as Text" instead'
        };
      }

      return result;

    } catch (error) {
      logError('ExportService: PDF export error', error);

      return {
        success: false,
        error: `PDF export failed: ${error.message}`,
        fallbackSuggestion: 'Use "Download as Text" as a fallback'
      };
    }
  }

  /**
   * Download as text file
   * @param {string} text - Text to download
   * @param {Object} metadata - File metadata
   * @returns {{success: boolean, error?: string}}
   */
  static downloadAsText(text, metadata) {
    return downloadAsText(text, metadata);
  }

  /**
   * Get available export methods
   * @returns {string[]} Array of available method names
   */
  static getAvailableMethods() {
    const methods = [ExportMethod.TEXT]; // Text always available

    if (isClipboardAvailable()) {
      methods.unshift(ExportMethod.CLIPBOARD);
    }

    // PDF available if jsPDF can load (always try)
    methods.push(ExportMethod.PDF);

    return methods;
  }

  /**
   * Get recommended export method
   * @returns {string} Recommended method name
   */
  static getRecommendedMethod() {
    // Prefer clipboard for speed, fallback to PDF for professional look
    if (isClipboardAvailable()) {
      return ExportMethod.CLIPBOARD;
    }

    return ExportMethod.PDF;
  }
}
