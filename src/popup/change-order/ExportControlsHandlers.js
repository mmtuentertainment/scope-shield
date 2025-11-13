/**
 * Export Controls Handlers
 *
 * Event handlers for export button actions (PDF, clipboard, text).
 * Manages button states during export and handles success/error cases.
 *
 * @module ExportControlsHandlers
 */

import ExportService from '../../lib/export/ExportService.js';
import { logInfo, logError } from '../../lib/utils/Logger.js';

/**
 * Export the given change order as a PDF, manage the export button state, and notify the user of the outcome.
 *
 * @param {ChangeOrder} changeOrder - The change order to export.
 * @param {Function} showNotification - Callback that accepts (message, type) to display user notifications.
 */
export async function handlePdfExport(changeOrder, showNotification) {
  if (!changeOrder) {
    showNotification('No change order available to export', 'error');
    return;
  }

  try {
    // Disable button during export
    const pdfBtn = document.getElementById('export-pdf-btn');
    if (pdfBtn) {
      pdfBtn.disabled = true;
      pdfBtn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">Exporting...</span>';
    }

    logInfo('ExportControlsHandlers.handlePdfExport: Starting PDF export');

    const result = await ExportService.exportAsPDF(changeOrder);

    if (result.success) {
      if (result.fallbackUsed) {
        showNotification(result.message, 'warning');
        logInfo('ExportControlsHandlers.handlePdfExport: Fallback used', {
          message: result.message
        });
      } else {
        showNotification(result.message, 'success');
        logInfo('ExportControlsHandlers.handlePdfExport: PDF export successful');
      }
    } else {
      showNotification(result.message, 'error');
      logError('ExportControlsHandlers.handlePdfExport: PDF export failed', {
        message: result.message
      });
    }
  } catch (error) {
    showNotification(`Export failed: ${error.message}`, 'error');
    logError('ExportControlsHandlers.handlePdfExport: Unexpected error', error);
  } finally {
    // Re-enable button
    const pdfBtn = document.getElementById('export-pdf-btn');
    if (pdfBtn) {
      pdfBtn.disabled = false;
      pdfBtn.innerHTML = '<span class="btn-icon">📄</span><span class="btn-text">Export PDF</span>';
    }
  }
}

/**
 * Copy the provided change order to the clipboard, manage the clipboard button state during the operation, and notify the user of success or failure.
 *
 * @param {ChangeOrder} changeOrder - The change order to copy.
 * @param {function(string, string):void} showNotification - Callback to display a notification; receives (message, type) where `type` is e.g. 'success' or 'error'.
 * @returns {Promise<void>} Resolves when the export flow (including UI updates and notifications) has completed.
 */
export async function handleClipboardExport(changeOrder, showNotification) {
  if (!changeOrder) {
    showNotification('No change order available to export', 'error');
    return;
  }

  try {
    // Disable button during export
    const clipboardBtn = document.getElementById('export-clipboard-btn');
    if (clipboardBtn) {
      clipboardBtn.disabled = true;
      clipboardBtn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">Copying...</span>';
    }

    logInfo('ExportControlsHandlers.handleClipboardExport: Starting clipboard copy');

    const result = await ExportService.copyToClipboard(changeOrder);

    if (result.success) {
      showNotification(result.message, 'success');
      logInfo('ExportControlsHandlers.handleClipboardExport: Copy successful');
    } else {
      showNotification(result.message, 'error');
      logError('ExportControlsHandlers.handleClipboardExport: Copy failed', {
        message: result.message
      });
    }
  } catch (error) {
    showNotification(`Copy failed: ${error.message}`, 'error');
    logError('ExportControlsHandlers.handleClipboardExport: Unexpected error', error);
  } finally {
    // Re-enable button
    const clipboardBtn = document.getElementById('export-clipboard-btn');
    if (clipboardBtn) {
      clipboardBtn.disabled = false;
      clipboardBtn.innerHTML = '<span class="btn-icon">📋</span><span class="btn-text">Copy to Clipboard</span>';
    }
  }
}

/**
 * Export the provided change order as text, updating the export button state and showing notifications for success, fallback, or error conditions.
 *
 * @param {ChangeOrder} changeOrder - The change order to export.
 * @param {Function} showNotification - Callback to display notifications. Called as showNotification(message, type) where type is typically 'success', 'error', or 'warning'.
 */
export async function handleTextExport(changeOrder, showNotification) {
  if (!changeOrder) {
    showNotification('No change order available to export', 'error');
    return;
  }

  try {
    // Disable button during export
    const textBtn = document.getElementById('export-text-btn');
    if (textBtn) {
      textBtn.disabled = true;
      textBtn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">Exporting...</span>';
    }

    logInfo('ExportControlsHandlers.handleTextExport: Starting text export');

    const result = await ExportService.exportAsText(changeOrder);

    if (result.success) {
      showNotification(result.message, 'success');
      logInfo('ExportControlsHandlers.handleTextExport: Text export successful');
    } else {
      showNotification(result.message, 'error');
      logError('ExportControlsHandlers.handleTextExport: Text export failed', {
        message: result.message
      });
    }
  } catch (error) {
    showNotification(`Export failed: ${error.message}`, 'error');
    logError('ExportControlsHandlers.handleTextExport: Unexpected error', error);
  } finally {
    // Re-enable button
    const textBtn = document.getElementById('export-text-btn');
    if (textBtn) {
      textBtn.disabled = false;
      textBtn.innerHTML = '<span class="btn-icon">📝</span><span class="btn-text">Export Text</span>';
    }
  }
}