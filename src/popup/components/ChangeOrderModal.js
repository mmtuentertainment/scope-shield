/**
 * Change Order Modal Component
 *
 * Displays change order document with integrated calculator and export controls.
 * Handles recalculation when pricing changes.
 *
 * @module ChangeOrderModal
 */

import { ChangeOrderModalIntegrations } from './ChangeOrderModalIntegrations.js';
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
    this.triggerElement = null;
    this.autoExportTimer = null;
    this.countdownNotification = null;

    // Integration helper (handles calculator, export, auto-export)
    this.integrations = new ChangeOrderModalIntegrations(this);

    // Event handlers (bound for cleanup)
    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleCloseClick = this.handleCloseClick.bind(this);

    // Debounced recalculation (300ms to prevent spam)
    this.debouncedRecalculate = debounce(
      (rate, hours) => this.integrations.recalculateDocument(rate, hours),
      300
    );
  }

  /**
   * Show the modal
   */
  async show() {
    logInfo('ChangeOrderModal: Showing modal');

    // Store trigger element for focus restoration
    this.triggerElement = document.activeElement;

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

    // Initialize auto-export timer
    await this.integrations.initializeAutoExport();
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

    // Cancel and destroy auto-export timer
    if (this.autoExportTimer) {
      this.autoExportTimer.destroy();
      this.autoExportTimer = null;
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

    // Return focus to trigger element
    if (this.triggerElement && typeof this.triggerElement.focus === 'function') {
      this.triggerElement.focus();
    }
    this.triggerElement = null;
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
    this.integrations.updateExportControls();
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
      // Cancel auto-export if timer is active
      if (this.autoExportTimer && this.autoExportTimer.isActive()) {
        this.autoExportTimer.cancel();
        showNotification(
          'auto-export-cancelled',
          'Auto-export cancelled',
          'info',
          2000
        );
      }

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

    // Countdown notification (initially hidden)
    this.countdownNotification = document.createElement('div');
    this.countdownNotification.className = 'countdown-notification';
    this.countdownNotification.style.display = 'none';
    this.countdownNotification.setAttribute('role', 'status');
    this.countdownNotification.setAttribute('aria-live', 'polite');
    this.countdownNotification.setAttribute('aria-atomic', 'true');
    body.appendChild(this.countdownNotification);

    // Document preview
    this.documentPreview = document.createElement('pre');
    this.documentPreview.className = 'document-preview';
    this.documentPreview.textContent = this.changeOrderText;
    body.appendChild(this.documentPreview);

    // Calculator container
    const calculatorContainer = document.createElement('div');
    calculatorContainer.className = 'calculator-container';
    this.integrations.mountCalculator(calculatorContainer);
    body.appendChild(calculatorContainer);

    // Export controls container
    const exportContainer = document.createElement('div');
    exportContainer.className = 'export-container';
    this.integrations.mountExportControls(exportContainer);
    body.appendChild(exportContainer);

    return body;
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
