// Export Controls Component
// Renders export buttons and handles export actions

import { ExportService } from '../../lib/change-order/export/ExportService.js';
import { showNotification } from './NotificationManager.js';
import { logInfo, logError } from '../../lib/utils/Logger.js';

/**
 * Export Controls Component
 * Provides UI for exporting change orders in multiple formats
 */
export class ExportControls {
  /**
   * @param {string} changeOrderText - Change order text to export
   * @param {Object} metadata - Export metadata
   * @param {string} metadata.clientName - Client name
   * @param {string} metadata.freelancerName - Freelancer name
   * @param {string} metadata.date - Date (YYYY-MM-DD)
   */
  constructor(changeOrderText, metadata = {}) {
    this.changeOrderText = changeOrderText;
    this.metadata = metadata;
    this.container = null;
    this.buttons = {};
    this.isExporting = false;
  }

  /**
   * Render export controls
   * @returns {HTMLElement} Export controls container
   */
  render() {
    this.container = document.createElement('div');
    this.container.className = 'export-controls';

    // Create header
    const header = document.createElement('h3');
    header.textContent = 'Export Change Order';
    header.className = 'export-controls-header';
    this.container.appendChild(header);

    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'export-buttons';

    // Create export buttons
    this.buttons.clipboard = this.createButton(
      'Copy to Clipboard',
      'clipboard-btn',
      () => this.handleClipboard(),
      '📋'
    );

    this.buttons.pdf = this.createButton(
      'Export as PDF',
      'pdf-btn',
      () => this.handlePDF(),
      '📄'
    );

    this.buttons.text = this.createButton(
      'Download as Text',
      'text-btn',
      () => this.handleText(),
      '📝'
    );

    buttonContainer.appendChild(this.buttons.clipboard);
    buttonContainer.appendChild(this.buttons.pdf);
    buttonContainer.appendChild(this.buttons.text);

    this.container.appendChild(buttonContainer);

    return this.container;
  }

  /**
   * Create export button
   * @param {string} label - Button label
   * @param {string} className - CSS class name
   * @param {Function} handler - Click handler
   * @param {string} icon - Button icon
   * @returns {HTMLElement}
   * @private
   */
  createButton(label, className, handler, icon) {
    const button = document.createElement('button');
    button.className = `export-btn ${className}`;
    
    // Use safe DOM methods instead of innerHTML
    const iconSpan = document.createElement('span');
    iconSpan.className = 'export-icon';
    iconSpan.textContent = icon;
    
    button.appendChild(iconSpan);
    button.appendChild(document.createTextNode(` ${label}`));
    
    button.addEventListener('click', handler);
    return button;
  }

  /**
   * Handle clipboard export
   * @private
   */
  async handleClipboard() {
    if (this.isExporting) return;

    try {
      this.setLoading(true, 'clipboard');

      const result = await ExportService.copyToClipboard(this.changeOrderText);

      if (result.success) {
        showNotification('toast-notification', '📋 Copied to clipboard! Ready to paste into email or message.', 'success', 3000);
        logInfo('ExportControls: Clipboard export successful');
      } else {
        showNotification('toast-notification', `❌ ${result.error}`, 'error', 5000);

        if (result.fallbackSuggestion) {
          setTimeout(() => {
            showNotification('toast-notification', `💡 ${result.fallbackSuggestion}`, 'info', 5000);
          }, 2000);
        }

        logError('ExportControls: Clipboard export failed', new Error(result.error));
      }

    } catch (error) {
      showNotification('toast-notification', '❌ Clipboard export failed. Try downloading as text instead.', 'error', 5000);
      logError('ExportControls: Clipboard export error', error);
    } finally {
      this.setLoading(false, 'clipboard');
    }
  }

  /**
   * Handle PDF export
   * @private
   */
  async handlePDF() {
    if (this.isExporting) return;

    try {
      this.setLoading(true, 'pdf');

      const result = await ExportService.exportAsPDF(
        this.changeOrderText,
        this.metadata
      );

      if (result.success) {
        showNotification('toast-notification', '📄 PDF downloaded successfully!', 'success', 3000);
        logInfo('ExportControls: PDF export successful');
      } else {
        showNotification('toast-notification', `❌ ${result.error}`, 'error', 5000);

        if (result.fallbackSuggestion) {
          setTimeout(() => {
            showNotification('toast-notification', `💡 ${result.fallbackSuggestion}`, 'info', 5000);
            this.highlightFallback('text');
          }, 2000);
        }

        logError('ExportControls: PDF export failed', new Error(result.error));
      }

    } catch (error) {
      showNotification('toast-notification', '❌ PDF export failed. Use "Download as Text" instead.', 'error', 5000);
      setTimeout(() => this.highlightFallback('text'), 2000);
      logError('ExportControls: PDF export error', error);
    } finally {
      this.setLoading(false, 'pdf');
    }
  }

  /**
   * Handle text export
   * @private
   */
  handleText() {
    if (this.isExporting) return;

    try {
      this.setLoading(true, 'text');

      const result = ExportService.downloadAsText(
        this.changeOrderText,
        this.metadata
      );

      if (result.success) {
        showNotification('toast-notification', '📝 Text file downloaded successfully!', 'success', 3000);
        logInfo('ExportControls: Text export successful');
      } else {
        showNotification('toast-notification', `❌ ${result.error}`, 'error', 5000);
        logError('ExportControls: Text export failed', new Error(result.error));
      }

    } catch (error) {
      showNotification('toast-notification', '❌ Text export failed. Please try again.', 'error', 5000);
      logError('ExportControls: Text export error', error);
    } finally {
      this.setLoading(false, 'text');
    }
  }

  /**
   * Restore button content after loading
   * @param {HTMLButtonElement} button - Button to restore
   * @private
   */
  restoreButtonContent(button) {
    if (!button.dataset.originalText) return;

    const icon = button.dataset.icon || '';
    const label = button.dataset.originalText.replace(icon, '').trim();

    button.textContent = '';
    const iconSpan = document.createElement('span');
    iconSpan.className = 'export-icon';
    iconSpan.textContent = icon;
    button.appendChild(iconSpan);
    button.appendChild(document.createTextNode(` ${label}`));

    delete button.dataset.originalText;
    delete button.dataset.icon;
  }

  /**
   * Set loading state for button
   * @param {boolean} loading - Loading state
   * @param {string} buttonKey - Button key ('clipboard', 'pdf', 'text')
   * @private
   */
  setLoading(loading, buttonKey) {
    this.isExporting = loading;

    const button = this.buttons[buttonKey];
    if (!button) return;

    if (loading) {
      button.disabled = true;
      button.classList.add('loading');
      // Store icon before nuking DOM
      const iconEl = button.querySelector('.export-icon');
      if (iconEl) {
        button.dataset.icon = iconEl.textContent || '';
      }
      button.dataset.originalText = button.textContent;
      button.textContent = 'Exporting...';
    } else {
      button.disabled = false;
      button.classList.remove('loading');
      this.restoreButtonContent(button);
    }

    // Disable all other buttons during export
    Object.values(this.buttons).forEach(btn => {
      btn.disabled = loading;
    });
  }

  /**
   * Highlight fallback button
   * @param {string} buttonKey - Button to highlight
   * @private
   */
  highlightFallback(buttonKey) {
    const button = this.buttons[buttonKey];
    if (!button) return;

    button.classList.add('fallback-highlight');

    setTimeout(() => {
      button.classList.remove('fallback-highlight');
    }, 3000);
  }

  /**
   * Cleanup component
   * Note: Event listeners are cleaned up automatically when buttons are removed from DOM
   */
  destroy() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }

    this.container = null;
    this.buttons = {};
  }
}
