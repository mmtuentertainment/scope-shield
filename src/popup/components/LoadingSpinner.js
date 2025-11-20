/**
 * Loading Spinner Component
 *
 * Reusable loading indicator for async operations.
 * Shows spinner with customizable message during export/generation.
 *
 * Part of Phase 8 (T295-T298): Loading States
 *
 * @module LoadingSpinner
 */

import { logInfo } from '../../lib/utils/Logger.js';

/**
 * Loading Spinner
 * Displays spinner with message during async operations
 */
export class LoadingSpinner {
  /**
   * @param {string} message - Loading message to display
   */
  constructor(message = 'Loading...') {
    this.message = message;
    this.container = null;
  }

  /**
   * Render the loading spinner
   * @returns {HTMLElement} Spinner container
   */
  render() {
    this.container = document.createElement('div');
    this.container.className = 'loading-spinner-overlay';
    this.container.setAttribute('role', 'status');
    this.container.setAttribute('aria-live', 'polite');
    this.container.setAttribute('aria-busy', 'true');

    // Spinner animation
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    this.container.appendChild(spinner);

    // Loading message
    const messageEl = document.createElement('div');
    messageEl.className = 'loading-message';
    messageEl.textContent = this.message;
    this.container.appendChild(messageEl);

    logInfo(`LoadingSpinner: Rendered with message "${this.message}"`);
    return this.container;
  }

  /**
   * Update loading message
   * @param {string} newMessage - New message to display
   */
  updateMessage(newMessage) {
    this.message = newMessage;

    if (this.container) {
      const messageEl = this.container.querySelector('.loading-message');
      if (messageEl) {
        messageEl.textContent = newMessage;
      }
    }

    logInfo(`LoadingSpinner: Updated message to "${newMessage}"`);
  }

  /**
   * Show the spinner
   */
  show() {
    if (this.container) {
      this.container.style.display = 'flex';
      logInfo('LoadingSpinner: Shown');
    }
  }

  /**
   * Hide the spinner
   */
  hide() {
    if (this.container) {
      this.container.style.display = 'none';
      logInfo('LoadingSpinner: Hidden');
    }
  }

  /**
   * Cleanup and remove from DOM
   */
  destroy() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }

    this.container = null;
    logInfo('LoadingSpinner: Destroyed');
  }
}
