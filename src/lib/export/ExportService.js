/**
 * Export Service
 *
 * Orchestrates all export functionality for change orders:
 * - PDF export (download)
 * - Clipboard copy (formatted text)
 * - Text file export (markdown-compatible)
 *
 * Implements graceful degradation: PDF failure → text fallback
 *
 * @module ExportService
 */

import pdfGenerator from './PDFGenerator.js';
import { logInfo, logError } from '../utils/Logger.js';
import { formatAsText, generateTextFilename } from './ChangeOrderFormatter.js';
import { downloadBlob } from './BlobDownloadHelper.js';

class ExportServiceClass {
  /**
   * Export change order as PDF and trigger download
   *
   * @param {ChangeOrder} changeOrder - Change order to export
   * @returns {Promise<{success: boolean, message: string, fallbackUsed?: boolean}>}
   */
  async exportAsPDF(changeOrder) {
    try {
      if (!changeOrder) {
        throw new Error('Change order is required');
      }

      logInfo('ExportService.exportAsPDF: Starting PDF export', {
        changeOrderId: changeOrder.id,
        changeOrderNumber: changeOrder.changeOrderNumber
      });

      // Generate PDF
      const pdfBlob = await pdfGenerator.generate(changeOrder);
      const filename = pdfGenerator.generateFilename(changeOrder);

      // Trigger download (delegate to helper)
      downloadBlob(pdfBlob, filename);

      logInfo('ExportService.exportAsPDF: PDF export successful', {
        filename,
        size: `${(pdfBlob.size / 1024).toFixed(1)}KB`
      });

      return {
        success: true,
        message: `PDF downloaded successfully: ${filename}`
      };
    } catch (error) {
      logError('ExportService.exportAsPDF: PDF export failed', {
        error: error.message
      });

      // Graceful degradation: fallback to text export
      try {
        logInfo('ExportService.exportAsPDF: Attempting text fallback');
        const textResult = await this.exportAsText(changeOrder);

        // Check if text export actually succeeded
        if (textResult.success) {
          return {
            success: true,
            message: 'PDF generation failed. Downloaded as text file instead.',
            fallbackUsed: true,
            fallbackResult: textResult
          };
        } else {
          // Text export also failed
          return {
            success: false,
            message: `Export failed: ${error.message}`
          };
        }
      } catch (fallbackError) {
        logError('ExportService.exportAsPDF: Fallback also failed', {
          error: fallbackError.message
        });

        return {
          success: false,
          message: `Export failed: ${error.message}`
        };
      }
    }
  }

  /**
   * Copy change order to clipboard as formatted text
   *
   * @param {ChangeOrder} changeOrder - Change order to copy
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async copyToClipboard(changeOrder) {
    try {
      if (!changeOrder) {
        throw new Error('Change order is required');
      }

      logInfo('ExportService.copyToClipboard: Starting clipboard copy', {
        changeOrderId: changeOrder.id
      });

      // Format change order as text (delegate to formatter)
      const formattedText = formatAsText(changeOrder);

      // Copy to clipboard using Clipboard API
      await navigator.clipboard.writeText(formattedText);

      logInfo('ExportService.copyToClipboard: Copy successful', {
        textLength: formattedText.length
      });

      return {
        success: true,
        message: 'Change order copied to clipboard'
      };
    } catch (error) {
      logError('ExportService.copyToClipboard: Copy failed', {
        error: error.message
      });

      return {
        success: false,
        message: `Clipboard copy failed: ${error.message}`
      };
    }
  }

  /**
   * Export change order as text file (markdown-compatible) and trigger download
   *
   * @param {ChangeOrder} changeOrder - Change order to export
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async exportAsText(changeOrder) {
    try {
      if (!changeOrder) {
        throw new Error('Change order is required');
      }

      logInfo('ExportService.exportAsText: Starting text export', {
        changeOrderId: changeOrder.id
      });

      // Format change order as text (delegate to formatter)
      const formattedText = formatAsText(changeOrder);

      // Create text blob
      const textBlob = new Blob([formattedText], { type: 'text/plain;charset=utf-8' });
      const filename = generateTextFilename(changeOrder);

      // Trigger download (delegate to helper)
      downloadBlob(textBlob, filename);

      logInfo('ExportService.exportAsText: Text export successful', {
        filename,
        size: `${(textBlob.size / 1024).toFixed(1)}KB`
      });

      return {
        success: true,
        message: `Text file downloaded successfully: ${filename}`
      };
    } catch (error) {
      logError('ExportService.exportAsText: Text export failed', {
        error: error.message
      });

      return {
        success: false,
        message: `Text export failed: ${error.message}`
      };
    }
  }

}

// Export singleton instance
const ExportService = new ExportServiceClass();
export default ExportService;

// Export class for testing
export { ExportServiceClass };
