/**
 * Change Order View Component
 *
 * Renders change order documents using TemplateEngine.
 * Handles document display, generation timing, and performance monitoring.
 *
 * @module ChangeOrderView
 */

import templateEngine from '../../lib/change-order/TemplateEngine.js';
import { logInfo, logError, logPerformance } from '../../lib/utils/Logger.js';

class ChangeOrderView {
  constructor(containerSelector = '#change-order-container') {
    this.containerSelector = containerSelector;
    this.container = null;
    this.currentChangeOrder = null;
  }

  /**
   * Initialize the view
   * Creates container if it doesn't exist
   */
  init() {
    this.container = document.querySelector(this.containerSelector);

    if (!this.container) {
      // Create container dynamically
      this.container = document.createElement('div');
      this.container.id = 'change-order-container';
      this.container.className = 'change-order-view';
      document.body.appendChild(this.container);
    }
  }

  /**
   * Render change order document
   *
   * @param {ChangeOrder} changeOrder - Change order to render
   * @returns {Promise<void>}
   * @throws {Error} If rendering fails
   */
  async render(changeOrder) {
    const startTime = performance.now();

    try {
      if (!changeOrder) {
        throw new Error('ChangeOrder is required');
      }

      this.currentChangeOrder = changeOrder;

      logInfo('ChangeOrderView.render: Starting render', {
        changeOrderId: changeOrder.id,
        changeOrderNumber: changeOrder.changeOrderNumber
      });

      // Ensure container exists
      if (!this.container) {
        this.init();
      }

      // Show loading state
      this._showLoading();

      // Prepare template values
      const templateValues = {
        changeOrderNumber: changeOrder.changeOrderNumber,
        date: changeOrder.dateCreated || new Date().toLocaleDateString(),
        clientName: changeOrder.clientName || 'Client',
        clientEmail: changeOrder.clientEmail,
        freelancerName: changeOrder.freelancerName || 'Your Name',
        originalScope: changeOrder.originalScope || 'No original scope defined',
        requestedChanges: changeOrder.requestedChanges, // Array - will be converted to list
        costEstimate: changeOrder.costEstimate || '$XXX',
        revisedTimeline: changeOrder.revisedTimeline || 'To be determined',
        paymentTerms: changeOrder.paymentTerms || 'Net 30',
        additionalNotes: changeOrder.additionalNotes || 'No additional notes'
      };

      // Use TemplateEngine to populate template
      const renderedHtml = await templateEngine.interpolate(templateValues);

      // Display rendered document
      this.container.innerHTML = renderedHtml;

      // Make container visible (Bug #1 fix: remove inline display:none)
      this.container.style.display = 'block';

      // Add interactive behaviors (if needed)
      this._attachEventListeners();

      // Log performance
      const duration = performance.now() - startTime;
      logPerformance('ChangeOrderView.render', duration);

      if (duration > 5000) {
        logError('ChangeOrderView.render: Render exceeded 5s threshold', {
          duration: `${duration.toFixed(0)}ms`,
          threshold: '5000ms'
        });
      }

      logInfo('ChangeOrderView.render: Render complete', {
        changeOrderId: changeOrder.id,
        duration: `${duration.toFixed(0)}ms`
      });

      // Scroll to view
      this.container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) {
      const duration = performance.now() - startTime;
      logError('ChangeOrderView.render: Render failed', {
        error: error.message,
        duration: `${duration.toFixed(0)}ms`
      });

      this._showError(error.message);
      throw error;
    }
  }

  /**
   * Show loading state
   * @private
   */
  _showLoading() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="change-order-loading">
        <div class="loading-spinner"></div>
        <p>Generating change order...</p>
      </div>
    `;
  }

  /**
   * Show error state
   * @private
   * @param {string} message - Error message
   */
  _showError(message) {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="change-order-error">
        <div class="error-icon">⚠️</div>
        <h3>Error Generating Change Order</h3>
        <p>${this._escapeHtml(message)}</p>
        <button id="change-order-retry-btn" class="btn btn-primary">
          Try Again
        </button>
      </div>
    `;
  }

  /**
   * Attach event listeners for interactive elements
   * @private
   */
  _attachEventListeners() {
    // Add click handlers for editable fields (if needed in Phase 4)
    // For Phase 3, document is read-only
  }

  /**
   * Clear the view
   */
  clear() {
    if (this.container) {
      this.container.innerHTML = '';
    }
    this.currentChangeOrder = null;
  }

  /**
   * Hide the view
   */
  hide() {
    if (this.container) {
      this.container.style.display = 'none';
    }
  }

  /**
   * Show the view
   */
  show() {
    if (this.container) {
      this.container.style.display = 'block';
    }
  }

  /**
   * Get current change order
   * @returns {ChangeOrder|null}
   */
  getCurrentChangeOrder() {
    return this.currentChangeOrder;
  }

  /**
   * Escape HTML to prevent XSS
   * @private
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  _escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Export current change order to clipboard
   * @returns {Promise<boolean>} True if successful
   */
  async exportToClipboard() {
    if (!this.currentChangeOrder) {
      logError('ChangeOrderView.exportToClipboard: No change order loaded');
      return false;
    }

    try {
      // Get document HTML (without styles for plain text)
      const textContent = this.container.innerText;

      await navigator.clipboard.writeText(textContent);

      logInfo('ChangeOrderView.exportToClipboard: Exported successfully', {
        changeOrderId: this.currentChangeOrder.id,
        length: textContent.length
      });

      return true;
    } catch (error) {
      logError('ChangeOrderView.exportToClipboard: Export failed', error);
      return false;
    }
  }

  /**
   * Print change order document
   */
  print() {
    if (!this.container || !this.currentChangeOrder) {
      logError('ChangeOrderView.print: No change order loaded');
      return;
    }

    window.print();

    logInfo('ChangeOrderView.print: Print dialog opened', {
      changeOrderId: this.currentChangeOrder.id
    });
  }
}

// Export singleton instance
const changeOrderView = new ChangeOrderView();
export default changeOrderView;

// Export class for testing
export { ChangeOrderView };
