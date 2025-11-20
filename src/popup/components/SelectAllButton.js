/**
 * Select All Button Component
 *
 * Fallback UI for manual copying when clipboard API is unavailable or denied.
 * Provides "Select All" functionality with visual feedback for manual Ctrl+C copying.
 *
 * Part of Phase 8 (T270-T274): Clipboard Permission Error Handling
 *
 * @module SelectAllButton
 */

import { logInfo, logError } from '../../lib/utils/Logger.js';

/**
 * Select All Button
 * Shows when clipboard access is denied, allows manual text selection + copy
 */
export class SelectAllButton {
  /**
   * @param {string} textToSelect - Text content to select
   * @param {HTMLElement} textContainer - Container element with text to select
   */
  constructor(textToSelect, textContainer) {
    if (!textContainer || !(textContainer instanceof HTMLElement)) {
      throw new TypeError('SelectAllButton: textContainer must be an HTMLElement');
    }

    this.textToSelect = textToSelect || '';
    this.textContainer = textContainer;
    this.container = null;
    this.button = null;
    this.resetTimeoutId = null; // CodeRabbit: Track timeout for cleanup

    // Event handlers (bound for cleanup)
    this.handleClick = this.handleClick.bind(this);
  }

  /**
   * Render the select all button with instructions
   * @returns {HTMLElement} Button container
   */
  render() {
    // Create container
    this.container = document.createElement('div');
    this.container.className = 'select-all-container';
    this.container.style.marginTop = '10px';
    this.container.style.padding = '10px';
    this.container.style.backgroundColor = '#fff3cd';
    this.container.style.border = '1px solid #ffc107';
    this.container.style.borderRadius = '4px';

    // Create instruction text
    const instruction = document.createElement('p');
    instruction.className = 'select-all-instruction';
    instruction.textContent = 'Clipboard access denied. Use the button below to select text:';
    instruction.style.margin = '0 0 10px 0';
    instruction.style.fontSize = '12px';
    instruction.style.color = '#856404';
    this.container.appendChild(instruction);

    // Create select all button
    this.button = document.createElement('button');
    this.button.className = 'btn btn-secondary select-all-btn';
    this.button.textContent = '✓ Select All Text';
    this.button.addEventListener('click', this.handleClick);
    this.container.appendChild(this.button);

    // Create copy hint
    const copyHint = document.createElement('p');
    copyHint.className = 'copy-hint';
    copyHint.textContent = 'After clicking, press Ctrl+C (or Cmd+C on Mac) to copy';
    copyHint.style.margin = '10px 0 0 0';
    copyHint.style.fontSize = '11px';
    copyHint.style.color = '#6c757d';
    copyHint.style.fontStyle = 'italic';
    this.container.appendChild(copyHint);

    logInfo('SelectAllButton: Rendered');
    return this.container;
  }

  /**
   * Handle button click - select all text
   * @private
   */
  handleClick() {
    logInfo('SelectAllButton: Selecting all text');

    try {
      // Create range and select text container contents
      const range = document.createRange();
      range.selectNodeContents(this.textContainer);

      // Clear existing selection and add new range
      const selection = window.getSelection();
      // CodeRabbit: Guard against null selection
      if (!selection) {
        throw new Error('window.getSelection() returned null');
      }
      selection.removeAllRanges();
      selection.addRange(range);

      // Visual feedback
      this.button.textContent = '✓ Text Selected! Press Ctrl+C to copy';
      this.button.classList.add('selection-active');

      // Restore button text after 3 seconds (CodeRabbit: Track timeout and guard callback)
      if (this.resetTimeoutId) {
        clearTimeout(this.resetTimeoutId);
      }
      this.resetTimeoutId = setTimeout(() => {
        if (!this.button) return; // Component may have been destroyed
        this.button.textContent = '✓ Select All Text';
        this.button.classList.remove('selection-active');
        this.resetTimeoutId = null;
      }, 3000);

      logInfo('SelectAllButton: Text selected successfully');

    } catch (error) {
      logError('SelectAllButton: Selection failed', error);

      // Fallback: try to select using textarea
      this.selectViaTextarea();
    }
  }

  /**
   * Fallback selection method using temporary textarea
   * @private
   */
  selectViaTextarea() {
    const textarea = document.createElement('textarea');
    textarea.value = this.textToSelect;
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);

    textarea.focus();
    textarea.select();

    // Cleanup after a brief moment
    setTimeout(() => {
      if (textarea.parentNode) {
        textarea.parentNode.removeChild(textarea);
      }
    }, 100);

    this.button.textContent = '✓ Text Selected! Press Ctrl+C';

    logInfo('SelectAllButton: Text selected via textarea fallback');
  }

  /**
   * Show the button
   */
  show() {
    if (this.container) {
      this.container.style.display = 'block';
      logInfo('SelectAllButton: Shown');
    }
  }

  /**
   * Hide the button
   */
  hide() {
    if (this.container) {
      this.container.style.display = 'none';
      logInfo('SelectAllButton: Hidden');
    }
  }

  /**
   * Cleanup and remove event listeners
   */
  destroy() {
    // CodeRabbit: Clear pending timeout to prevent race condition
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
      this.resetTimeoutId = null;
    }

    if (this.button) {
      this.button.removeEventListener('click', this.handleClick);
    }

    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }

    this.container = null;
    this.button = null;

    logInfo('SelectAllButton: Destroyed');
  }
}
