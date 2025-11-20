/**
 * Manual Change Order Button Component
 *
 * Provides button to create change orders manually when no detection events exist.
 * Enables freelancers to generate change orders without automatic scope creep detection.
 *
 * @module ManualChangeOrderButton
 */

import { logInfo, logError } from '../../lib/utils/Logger.js';
import { showNotification } from './NotificationManager.js';

/**
 * Manual Change Order Button
 * Shows when detectionEvents.length === 0, allows manual creation
 */
export class ManualChangeOrderButton {
  /**
   * @param {Object} options - Configuration options
   * @param {Function} options.onCreateManual - Callback to create manual change order
   */
  constructor(options = {}) {
    if (!options.onCreateManual || typeof options.onCreateManual !== 'function') {
      throw new TypeError('ManualChangeOrderButton: options.onCreateManual must be a function');
    }

    this.onCreateManual = options.onCreateManual;

    // DOM references
    this.container = null;
    this.button = null;

    // Event handlers (bound for cleanup)
    this.handleClick = this.handleClick.bind(this);
  }

  /**
   * Render the button and its container
   * @returns {HTMLElement} Button container element
   */
  render() {
    // Create container
    this.container = document.createElement('div');
    this.container.className = 'manual-change-order-container';
    this.container.style.textAlign = 'center';
    this.container.style.padding = '20px';

    // Create explanatory text
    const explanation = document.createElement('p');
    explanation.className = 'manual-change-order-explanation';
    explanation.textContent = 'No scope creep detected. Create a change order manually:';
    explanation.style.marginBottom = '10px';
    explanation.style.color = '#666';
    this.container.appendChild(explanation);

    // Create button
    this.button = document.createElement('button');
    this.button.id = 'manual-change-order-btn';
    this.button.className = 'btn btn-primary';
    this.button.textContent = 'Create Manual Change Order';
    this.button.addEventListener('click', this.handleClick);
    this.container.appendChild(this.button);

    logInfo('ManualChangeOrderButton: Rendered');
    return this.container;
  }

  /**
   * Handle button click
   * @private
   */
  async handleClick() {
    if (this.button.disabled) {
      return; // Prevent double-click
    }

    logInfo('ManualChangeOrderButton: Creating manual change order');

    // Disable button and show loading state
    this.button.disabled = true;
    const originalText = this.button.textContent;
    this.button.textContent = 'Creating...';

    try {
      await this.onCreateManual();
      logInfo('ManualChangeOrderButton: Manual change order created successfully');
    } catch (error) {
      logError('ManualChangeOrderButton: Failed to create manual change order', error);

      showNotification(
        'toast-notification',
        'Failed to create change order. Please try again.',
        'error',
        3000
      );
    } finally {
      // Restore button state
      this.button.disabled = false;
      this.button.textContent = originalText;
    }
  }

  /**
   * Show the button
   */
  show() {
    if (this.container) {
      this.container.style.display = 'block';
      logInfo('ManualChangeOrderButton: Shown');
    }
  }

  /**
   * Hide the button
   */
  hide() {
    if (this.container) {
      this.container.style.display = 'none';
      logInfo('ManualChangeOrderButton: Hidden');
    }
  }

  /**
   * Check if button is currently visible
   * @returns {boolean} True if visible
   */
  isVisible() {
    return this.container && this.container.style.display !== 'none';
  }

  /**
   * Cleanup and remove event listeners
   */
  destroy() {
    if (this.button) {
      this.button.removeEventListener('click', this.handleClick);
    }

    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }

    this.container = null;
    this.button = null;

    logInfo('ManualChangeOrderButton: Destroyed');
  }
}
