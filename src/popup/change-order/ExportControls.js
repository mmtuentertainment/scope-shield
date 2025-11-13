/**
 * Export Controls Component
 *
 * Provides UI controls for exporting change orders in multiple formats:
 * - PDF download
 * - Copy to clipboard
 * - Text file download
 *
 * Displays success/error notifications and handles user interactions.
 *
 * @module ExportControls
 */

import { logInfo } from '../../lib/utils/Logger.js';
import { getControlsHTML } from './ExportControlsTemplate.js';
import {
  handlePdfExport,
  handleClipboardExport,
  handleTextExport
} from './ExportControlsHandlers.js';
import {
  showNotification as showNotif,
  hideNotification as hideNotif
} from '../components/NotificationManager.js';

class ExportControls {
  constructor(containerSelector = '#export-controls-container') {
    this.containerSelector = containerSelector;
    this.container = null;
    this.currentChangeOrder = null;
    this.notificationTimeout = null;
  }

  /**
   * Initialize export controls
   * Creates container and renders buttons
   */
  init() {
    this.container = document.querySelector(this.containerSelector);

    if (!this.container) {
      // Create container if it doesn't exist
      this.container = document.createElement('div');
      this.container.id = 'export-controls-container';
      this.container.className = 'export-controls';
      document.body.appendChild(this.container);
    }

    this._render();
    this._attachEventListeners();

    logInfo('ExportControls.init: Controls initialized');
  }

  /**
   * Set the current change order to export
   *
   * @param {ChangeOrder} changeOrder - Change order to export
   */
  setChangeOrder(changeOrder) {
    this.currentChangeOrder = changeOrder;
    this._updateButtonStates();

    logInfo('ExportControls.setChangeOrder: Change order set', {
      changeOrderId: changeOrder?.id
    });
  }

  /**
   * Clear the current change order
   */
  clearChangeOrder() {
    this.currentChangeOrder = null;
    this._updateButtonStates();
  }

  /**
   * Render export controls HTML (delegates to template)
   *
   * @private
   */
  _render() {
    if (!this.container) return;
    this.container.innerHTML = getControlsHTML();
  }

  /**
   * Attach event listeners to export buttons (delegates to handlers)
   *
   * @private
   */
  _attachEventListeners() {
    const pdfBtn = document.getElementById('export-pdf-btn');
    const clipboardBtn = document.getElementById('export-clipboard-btn');
    const textBtn = document.getElementById('export-text-btn');

    if (pdfBtn) {
      pdfBtn.addEventListener('click', () =>
        handlePdfExport(this.currentChangeOrder, (msg, type) => this._showNotification(msg, type))
      );
    }

    if (clipboardBtn) {
      clipboardBtn.addEventListener('click', () =>
        handleClipboardExport(this.currentChangeOrder, (msg, type) => this._showNotification(msg, type))
      );
    }

    if (textBtn) {
      textBtn.addEventListener('click', () =>
        handleTextExport(this.currentChangeOrder, (msg, type) => this._showNotification(msg, type))
      );
    }
  }

  /**
   * Show notification message (delegates to notification manager)
   *
   * @private
   * @param {string} message - Notification message
   * @param {string} type - Notification type ('success', 'error', 'warning')
   */
  _showNotification(message, type = 'info') {
    // Clear existing timeout
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }

    // Show notification using manager
    this.notificationTimeout = showNotif('export-notification', message, type);
  }

  /**
   * Hide notification (delegates to notification manager)
   */
  hideNotification() {
    hideNotif('export-notification', this.notificationTimeout);
    this.notificationTimeout = null;
  }

  /**
   * Update button states based on current change order
   *
   * @private
   */
  _updateButtonStates() {
    const pdfBtn = document.getElementById('export-pdf-btn');
    const clipboardBtn = document.getElementById('export-clipboard-btn');
    const textBtn = document.getElementById('export-text-btn');

    const hasChangeOrder = !!this.currentChangeOrder;

    if (pdfBtn) pdfBtn.disabled = !hasChangeOrder;
    if (clipboardBtn) clipboardBtn.disabled = !hasChangeOrder;
    if (textBtn) textBtn.disabled = !hasChangeOrder;
  }

  /**
   * Show export controls
   */
  show() {
    if (this.container) {
      this.container.style.display = 'block';
    }
  }

  /**
   * Hide export controls
   */
  hide() {
    if (this.container) {
      this.container.style.display = 'none';
    }
  }

  /**
   * Destroy export controls and clean up
   */
  destroy() {
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }

    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }

    this.container = null;
    this.currentChangeOrder = null;

    logInfo('ExportControls.destroy: Controls destroyed');
  }
}

// Export singleton instance
const exportControls = new ExportControls();
export default exportControls;

// Export class for testing
export { ExportControls };
