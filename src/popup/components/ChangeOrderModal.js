/**
 * Change Order Modal Component
 *
 * Displays change order document with integrated calculator and export controls.
 * Handles recalculation when pricing changes.
 *
 * @module ChangeOrderModal
 */

import { PricingCalculatorWidget } from '../../lib/change-order/PricingCalculatorWidget.js';
import { ExportControls } from './ExportControls.js';
import { showNotification } from './NotificationManager.js';
import { logInfo, logError } from '../../lib/utils/Logger.js';
import { debounce } from '../utils/debounce.js';

/**
 * Change Order Modal
 * Reusable modal for displaying change order with calculator and export options
 */
export class ChangeOrderModal {
  /**
   * @param {string} changeOrderText - Initial change order document text
   * @param {Object} metadata - Document metadata
   * @param {string} metadata.clientName - Client name for export filenames
   * @param {string} metadata.freelancerName - Freelancer name
   * @param {string} metadata.date - Document date (YYYY-MM-DD)
   * @param {Object} calculatorOptions - Calculator configuration
   * @param {number} calculatorOptions.hourlyRate - Initial hourly rate
   * @param {number} calculatorOptions.estimatedHours - Initial estimated hours
   * @param {Function} calculatorOptions.onRecalculate - Async callback (rate, hours) => newDocument
   */
  constructor(changeOrderText, metadata = {}, calculatorOptions = {}) {
    this.changeOrderText = changeOrderText;
    this.metadata = metadata;
    this.calculatorOptions = calculatorOptions;

    // Component instances
    this.overlay = null;
    this.modal = null;
    this.calculator = null;
    this.exportControls = null;
    this.documentPreview = null;

    // Event handlers (bound for cleanup)
    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleCloseClick = this.handleCloseClick.bind(this);

    // Debounced recalculation (300ms to prevent spam)
    this.debouncedRecalculate = debounce(
      this.recalculateDocument.bind(this),
      300
    );
  }

  /**
   * Show the modal
   */
  show() {
    logInfo('ChangeOrderModal: Showing modal');

    // Create modal structure
    this.createModal();

    // Add to DOM
    document.body.appendChild(this.overlay);

    // Add event listeners
    document.addEventListener('keydown', this.handleKeydown);

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Focus close button for accessibility
    const closeBtn = this.modal.querySelector('.close-btn');
    if (closeBtn) {
      closeBtn.focus();
    }
  }

  /**
   * Close the modal
   */
  close() {
    logInfo('ChangeOrderModal: Closing modal');

    // Cancel any pending debounced recalculations
    if (this.debouncedRecalculate && this.debouncedRecalculate.cancel) {
      this.debouncedRecalculate.cancel();
    }

    // Cleanup event listeners
    document.removeEventListener('keydown', this.handleKeydown);

    // Restore body scroll
    document.body.style.overflow = '';

    // Cleanup component instances
    if (this.calculator) {
      this.calculator.destroy();
      this.calculator = null;
    }

    if (this.exportControls) {
      this.exportControls.destroy();
      this.exportControls = null;
    }

    // Remove from DOM
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }

    this.overlay = null;
    this.modal = null;
    this.documentPreview = null;
  }

  /**
   * Update document text (called after recalculation)
   * @param {string} newText - Updated change order text
   */
  updateDocument(newText) {
    this.changeOrderText = newText;

    // Update preview
    if (this.documentPreview) {
      this.documentPreview.textContent = newText;
    }

    // Recreate export controls with new text
    this.updateExportControls();
  }

  /**
   * Create modal DOM structure
   * @private
   */
  createModal() {
    // Overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'change-order-modal-overlay';

    // Close modal when clicking overlay (not modal content)
    this.overlay.addEventListener('click', (event) => {
      if (event.target === this.overlay) {
        this.close();
      }
    });

    // Modal container
    this.modal = document.createElement('div');
    this.modal.className = 'change-order-modal';
    this.modal.setAttribute('role', 'dialog');
    this.modal.setAttribute('aria-modal', 'true');
    this.modal.setAttribute('aria-labelledby', 'change-order-modal-title');
    this.modal.setAttribute('aria-describedby', 'change-order-modal-desc');

    // Header
    const header = this.createHeader();
    this.modal.appendChild(header);

    // Body
    const body = this.createBody();
    this.modal.appendChild(body);

    this.overlay.appendChild(this.modal);
  }

  /**
   * Create modal header with close button
   * @private
   * @returns {HTMLElement}
   */
  createHeader() {
    const header = document.createElement('div');
    header.className = 'modal-header';

    const title = document.createElement('h2');
    title.id = 'change-order-modal-title';
    title.textContent = 'Change Order Request';
    header.appendChild(title);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-btn';
    closeBtn.textContent = '×';
    closeBtn.setAttribute('aria-label', 'Close modal');
    closeBtn.addEventListener('click', this.handleCloseClick);
    header.appendChild(closeBtn);

    return header;
  }

  /**
   * Create modal body with preview, calculator, and export controls
   * @private
   * @returns {HTMLElement}
   */
  createBody() {
    const body = document.createElement('div');
    body.className = 'modal-body';

    // Add accessible description (visually hidden)
    const description = document.createElement('div');
    description.id = 'change-order-modal-desc';
    description.className = 'sr-only';
    description.textContent = 'Modal dialog for reviewing and exporting change order with pricing calculator';
    body.appendChild(description);

    // Document preview
    this.documentPreview = document.createElement('pre');
    this.documentPreview.className = 'document-preview';
    this.documentPreview.textContent = this.changeOrderText;
    body.appendChild(this.documentPreview);

    // Calculator container
    const calculatorContainer = document.createElement('div');
    calculatorContainer.className = 'calculator-container';
    this.mountCalculator(calculatorContainer);
    body.appendChild(calculatorContainer);

    // Export controls container
    const exportContainer = document.createElement('div');
    exportContainer.className = 'export-container';
    this.mountExportControls(exportContainer);
    body.appendChild(exportContainer);

    return body;
  }

  /**
   * Mount calculator widget
   * @private
   * @param {HTMLElement} container - Container element
   */
  mountCalculator(container) {
    this.calculator = new PricingCalculatorWidget({
      initialRate: this.calculatorOptions.hourlyRate || 0,
      initialHours: this.calculatorOptions.estimatedHours || 0,
      onCalculate: (values) => {
        // Debounced recalculation when rate or hours change
        this.debouncedRecalculate(values.rate, values.hours);
      }
    });

    const calculatorElement = this.calculator.render();
    container.appendChild(calculatorElement);
  }

  /**
   * Mount export controls
   * @private
   * @param {HTMLElement} container - Container element
   */
  mountExportControls(container) {
    this.exportControls = new ExportControls(this.changeOrderText, {
      clientName: this.metadata.clientName,
      freelancerName: this.metadata.freelancerName,
      date: this.metadata.date
    });

    const exportElement = this.exportControls.render();
    container.appendChild(exportElement);
  }

  /**
   * Update export controls with new document text
   * @private
   */
  updateExportControls() {
    if (!this.exportControls) {
      return;
    }

    // Get container
    const container = this.modal.querySelector('.export-container');
    if (!container) {
      return;
    }

    // Cleanup old instance
    this.exportControls.destroy();

    // Clear container
    container.textContent = '';

    // Create new instance with updated text
    this.mountExportControls(container);
  }

  /**
   * Recalculate document with new pricing
   * @private
   * @param {number} newRate - New hourly rate
   * @param {number} newHours - New estimated hours
   */
  async recalculateDocument(newRate, newHours) {
    if (!this.calculatorOptions.onRecalculate) {
      logError('ChangeOrderModal: onRecalculate callback not provided', new Error('Missing callback'));
      return;
    }

    try {
      logInfo(`ChangeOrderModal: Recalculating with rate=${newRate}, hours=${newHours}`);

      // Call the recalculate callback (async)
      const newDocument = await this.calculatorOptions.onRecalculate(newRate, newHours);

      // Guard: Check if modal still exists before updating
      if (!this.modal || !this.documentPreview) {
        logInfo('ChangeOrderModal: Modal closed during recalculation, skipping update');
        return;
      }

      // Update document
      this.updateDocument(newDocument);
    } catch (error) {
      logError('ChangeOrderModal: Recalculation failed', error);

      // Notify user of failure
      showNotification(
        'recalc-error',
        'Failed to update document. Please try again.',
        'error',
        5000
      );
    }
  }

  /**
   * Handle keyboard events (Escape to close, Tab for focus trap)
   * @private
   * @param {KeyboardEvent} event - Keyboard event
   */
  handleKeydown(event) {
    if (event.key === 'Escape') {
      this.close();
    } else if (event.key === 'Tab') {
      this.trapFocus(event);
    }
  }

  /**
   * Trap focus within modal for accessibility
   * @private
   * @param {KeyboardEvent} event - Tab keyboard event
   */
  trapFocus(event) {
    if (!this.modal) {
      return;
    }

    const focusableElements = this.modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) {
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      // Shift+Tab: going backwards
      if (document.activeElement === firstElement) {
        lastElement.focus();
        event.preventDefault();
      }
    } else {
      // Tab: going forwards
      if (document.activeElement === lastElement) {
        firstElement.focus();
        event.preventDefault();
      }
    }
  }

  /**
   * Handle close button click
   * @private
   */
  handleCloseClick() {
    this.close();
  }
}
