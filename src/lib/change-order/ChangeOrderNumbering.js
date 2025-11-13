/**
 * Change Order Numbering Service
 *
 * Generates sequential, zero-padded change order numbers per client.
 * Format: "#001", "#002", "#003", etc.
 *
 * @module ChangeOrderNumbering
 */

import changeOrderHistory from './ChangeOrderHistory.js';
import { logInfo, logError } from '../utils/Logger.js';

/**
 * Number of digits for change order numbers (zero-padded)
 * @const
 */
const NUMBER_PADDING = 3;

class ChangeOrderNumberingService {
  /**
   * Get next change order number for a specific client
   * @param {string} clientEmail - Client email address
   * @returns {Promise<string>} Next change order number (e.g., "#001", "#002")
   */
  async getNextNumberForClient(clientEmail) {
    try {
      if (!clientEmail || typeof clientEmail !== 'string') {
        logError('ChangeOrderNumbering.getNextNumberForClient: Invalid clientEmail', {
          clientEmail
        });
        return this._formatNumber(1); // Default to #001
      }

      // Get all existing orders for client
      const allOrders = await changeOrderHistory.getAllForClient(clientEmail);

      if (allOrders.length === 0) {
        // First change order for this client
        logInfo('ChangeOrderNumbering.getNextNumberForClient: First order for client', {
          clientEmail
        });
        return this._formatNumber(1);
      }

      // Extract numbers from existing change order numbers
      const existingNumbers = allOrders
        .map(order => this._extractNumber(order.changeOrderNumber))
        .filter(num => num !== null);

      if (existingNumbers.length === 0) {
        // No valid numbers found, start from 1
        return this._formatNumber(1);
      }

      // Get highest existing number and increment
      const maxNumber = Math.max(...existingNumbers);
      const nextNumber = maxNumber + 1;

      logInfo('ChangeOrderNumbering.getNextNumberForClient: Generated next number', {
        clientEmail,
        maxNumber,
        nextNumber: this._formatNumber(nextNumber)
      });

      return this._formatNumber(nextNumber);
    } catch (error) {
      logError('ChangeOrderNumbering.getNextNumberForClient: Error', error);
      return this._formatNumber(1); // Fallback to #001
    }
  }

  /**
   * Format number as zero-padded string with # prefix
   * @private
   * @param {number} num - Number to format (1, 2, 3, etc.)
   * @returns {string} Formatted number ("#001", "#002", "#003", etc.)
   */
  _formatNumber(num) {
    if (!Number.isInteger(num) || num < 1) {
      return this._formatNumber(1);
    }

    // Zero-pad to NUMBER_PADDING digits
    const paddedNumber = String(num).padStart(NUMBER_PADDING, '0');
    return `#${paddedNumber}`;
  }

  /**
   * Extract numeric value from change order number
   * @private
   * @param {string} changeOrderNumber - Change order number (e.g., "#001", "#042")
   * @returns {number|null} Extracted number or null if invalid
   *
   * @example
   * _extractNumber("#001") // Returns 1
   * _extractNumber("#042") // Returns 42
   * _extractNumber("invalid") // Returns null
   */
  _extractNumber(changeOrderNumber) {
    if (!changeOrderNumber || typeof changeOrderNumber !== 'string') {
      return null;
    }

    // Remove # prefix and any whitespace
    const cleaned = changeOrderNumber.replace(/^#\s*/, '').trim();

    // Parse as integer
    const num = parseInt(cleaned, 10);

    // Validate it's a positive integer
    if (!Number.isInteger(num) || num < 1) {
      return null;
    }

    return num;
  }

  /**
   * Validate change order number format
   * @param {string} changeOrderNumber - Change order number to validate
   * @returns {boolean} True if valid format
   *
   * @example
   * validateFormat("#001") // Returns true
   * validateFormat("#042") // Returns true
   * validateFormat("001") // Returns false (missing #)
   * validateFormat("#ABC") // Returns false (not a number)
   */
  validateFormat(changeOrderNumber) {
    if (!changeOrderNumber || typeof changeOrderNumber !== 'string') {
      return false;
    }

    // Must start with #
    if (!changeOrderNumber.startsWith('#')) {
      return false;
    }

    // Extract number and validate
    const num = this._extractNumber(changeOrderNumber);
    return num !== null && num >= 1;
  }

  /**
   * Reformat change order number to ensure consistent padding
   * @param {string} changeOrderNumber - Change order number (may have inconsistent padding)
   * @returns {string|null} Reformatted number or null if invalid
   *
   * @example
   * reformat("#1") // Returns "#001"
   * reformat("#42") // Returns "#042"
   * reformat("invalid") // Returns null
   */
  reformat(changeOrderNumber) {
    const num = this._extractNumber(changeOrderNumber);
    return num !== null ? this._formatNumber(num) : null;
  }

  /**
   * Get current highest number for a client (without incrementing)
   * @param {string} clientEmail - Client email address
   * @returns {Promise<string|null>} Current highest number or null if no orders
   */
  async getCurrentNumberForClient(clientEmail) {
    try {
      const allOrders = await changeOrderHistory.getAllForClient(clientEmail);

      if (allOrders.length === 0) {
        return null;
      }

      const existingNumbers = allOrders
        .map(order => this._extractNumber(order.changeOrderNumber))
        .filter(num => num !== null);

      if (existingNumbers.length === 0) {
        return null;
      }

      const maxNumber = Math.max(...existingNumbers);
      return this._formatNumber(maxNumber);
    } catch (error) {
      logError('ChangeOrderNumbering.getCurrentNumberForClient: Error', error);
      return null;
    }
  }
}

// Export singleton instance
const changeOrderNumberingInstance = new ChangeOrderNumberingService();
export default changeOrderNumberingInstance;

// Export class for testing
export { ChangeOrderNumberingService, NUMBER_PADDING };
