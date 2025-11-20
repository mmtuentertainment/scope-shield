/**
 * Inline Field Editor Component
 *
 * Provides contenteditable field editing with blur-save pattern,
 * input sanitization, and auto-export timer reset coordination.
 *
 * @module InlineFieldEditor
 */

import { sanitizeText } from '../../lib/utils/Sanitizer.js';
import { logInfo, logError } from '../../lib/utils/Logger.js';

/**
 * Inline Field Editor
 * Makes change order fields editable without closing modal
 */
export class InlineFieldEditor {
  /**
   * @param {string} fieldName - Field identifier (e.g., 'costEstimate')
   * @param {string} initialValue - Initial field value
   * @param {Object} options - Configuration options
   * @param {Function} options.onSave - Callback when field is saved (fieldName, newValue)
   * @param {Function} [options.onEdit] - Optional callback when editing starts
   * @param {number} [options.maxLength=500] - Maximum field length
   * @param {boolean} [options.multiline=false] - Allow multiline editing
   */
  constructor(fieldName, initialValue, options = {}) {
    if (!fieldName || typeof fieldName !== 'string') {
      throw new TypeError('InlineFieldEditor: fieldName must be a non-empty string');
    }
    if (!options.onSave || typeof options.onSave !== 'function') {
      throw new TypeError('InlineFieldEditor: options.onSave must be a function');
    }

    this.fieldName = fieldName;
    this.value = initialValue || '';
    this.onSave = options.onSave;
    this.onEdit = options.onEdit;
    // CodeRabbit: Tighten option defaults to handle falsy-but-intentional values
    this.maxLength = typeof options.maxLength === 'number' && options.maxLength > 0 ? options.maxLength : 500;
    this.multiline = options.multiline === true;

    // DOM references
    this.element = null;
    this.originalValue = this.value;

    // Event handlers (bound for cleanup)
    this.handleBlur = this.handleBlur.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
  }

  /**
   * Render the editable field
   * @returns {HTMLElement} Editable field element
   */
  render() {
    // Create wrapper with contenteditable
    this.element = document.createElement(this.multiline ? 'div' : 'span');
    this.element.className = 'inline-editor';
    this.element.contentEditable = 'true';
    this.element.textContent = this.value;
    this.element.setAttribute('role', 'textbox');
    this.element.setAttribute('aria-label', `Editable ${this.fieldName}`);
    this.element.setAttribute('data-field-name', this.fieldName);

    // Add event listeners
    this.element.addEventListener('blur', this.handleBlur);
    this.element.addEventListener('focus', this.handleFocus);
    this.element.addEventListener('input', this.handleInput);
    this.element.addEventListener('keydown', this.handleKeydown);

    return this.element;
  }

  /**
   * Handle focus event (editing starts)
   * @private
   */
  handleFocus() {
    // Store original value for potential revert
    this.originalValue = this.element.textContent;

    // Notify parent that editing started
    if (this.onEdit) {
      try {
        this.onEdit(this.fieldName);
      } catch (error) {
        logError('InlineFieldEditor: onEdit callback failed', error);
      }
    }

    // Add visual indicator
    this.element.classList.add('editing');
  }

  /**
   * Handle input event (prevent exceeding max length)
   * @private
   */
  handleInput() {
    const text = this.element.textContent;

    // Enforce max length
    if (text.length > this.maxLength) {
      // Truncate text
      this.element.textContent = text.slice(0, this.maxLength);

      // Restore cursor to end (CodeRabbit: Guard getSelection)
      const range = document.createRange();
      const selection = window.getSelection();
      if (!selection) return; // No selection available
      range.selectNodeContents(this.element);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  /**
   * Handle keydown event (Enter to save, Escape to cancel)
   * @private
   * @param {KeyboardEvent} event - Keyboard event
   */
  handleKeydown(event) {
    if (event.key === 'Enter' && !this.multiline) {
      // Single-line: Enter saves and blurs
      event.preventDefault();
      this.element.blur();
    } else if (event.key === 'Escape') {
      // Escape cancels and reverts
      event.preventDefault();
      this.revert();
      this.element.blur();
    }
  }

  /**
   * Handle blur event (save edited value)
   * @private
   */
  handleBlur() {
    const rawValue = this.element.textContent;

    // Sanitize input
    const sanitized = sanitizeText(rawValue, this.maxLength);

    // CodeRabbit Round 4: Always update DOM to sanitized value first
    this.element.textContent = sanitized;

    // Remove visual indicator
    this.element.classList.remove('editing');

    // If sanitized value is unchanged, nothing to save
    if (sanitized === this.value) {
      return;
    }

    // Notify parent
    try {
      this.onSave(this.fieldName, sanitized);
      // CodeRabbit: Only update internal value after successful save
      this.value = sanitized;
      logInfo(`InlineFieldEditor: Saved ${this.fieldName}`); // CodeRabbit Round 4: Avoid logging PII
    } catch (error) {
      logError('InlineFieldEditor: onSave callback failed', error);
      // CodeRabbit: Revert both DOM and internal value on error
      this.value = this.originalValue;
      this.revert();
    }
  }

  /**
   * Revert to original value (cancel edit)
   */
  revert() {
    this.element.textContent = this.originalValue;
    this.element.classList.remove('editing');
    logInfo(`InlineFieldEditor: Reverted ${this.fieldName}`);
  }

  /**
   * Update field value programmatically
   * @param {string} newValue - New value to display
   */
  setValue(newValue) {
    this.value = newValue || '';
    if (this.element) {
      this.element.textContent = this.value;
    }
  }

  /**
   * Get current field value
   * @returns {string} Current value
   */
  getValue() {
    return this.value;
  }

  /**
   * Cleanup and remove event listeners
   */
  destroy() {
    if (this.element) {
      this.element.removeEventListener('blur', this.handleBlur);
      this.element.removeEventListener('focus', this.handleFocus);
      this.element.removeEventListener('input', this.handleInput);
      this.element.removeEventListener('keydown', this.handleKeydown);

      if (this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }

      this.element = null;
    }

    logInfo(`InlineFieldEditor: Destroyed ${this.fieldName}`);
  }
}
