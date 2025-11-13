/**
 * Change Order History Service
 *
 * Manages change order history storage with per-client indexing and FIFO deletion.
 * Stores up to 50 change orders per client in chrome.storage.local.
 *
 * @module ChangeOrderHistory
 */

import { ChangeOrder } from './ChangeOrder.js';
import { logInfo, logError } from '../utils/Logger.js';

/**
 * Storage key for change order history
 * @const
 */
const STORAGE_KEY = 'scopeshield_changeorder_history_v1';

/**
 * Maximum change orders to store per client
 * @const
 */
const MAX_ORDERS_PER_CLIENT = 50;

class ChangeOrderHistoryService {
  /**
   * Get last change order for a specific client
   * @param {string} clientEmail - Client email address
   * @returns {Promise<ChangeOrder|null>} Most recent change order or null if none
   */
  async getLastForClient(clientEmail) {
    try {
      if (!clientEmail || typeof clientEmail !== 'string') {
        logError('ChangeOrderHistory.getLastForClient: Invalid clientEmail', { clientEmail });
        return null;
      }

      const allOrders = await this._loadAllOrders();
      const clientOrders = allOrders[clientEmail] || [];

      if (clientOrders.length === 0) {
        return null;
      }

      // Return most recent (last in array, sorted by dateCreated)
      const lastOrderData = clientOrders[clientOrders.length - 1];
      return ChangeOrder.fromJSON(lastOrderData);
    } catch (error) {
      logError('ChangeOrderHistory.getLastForClient: Error', error);
      return null;
    }
  }

  /**
   * Get all change orders for a specific client (max 50, most recent first)
   * @param {string} clientEmail - Client email address
   * @returns {Promise<ChangeOrder[]>} Array of change orders (newest first)
   */
  async getAllForClient(clientEmail) {
    try {
      if (!clientEmail || typeof clientEmail !== 'string') {
        logError('ChangeOrderHistory.getAllForClient: Invalid clientEmail', { clientEmail });
        return [];
      }

      const allOrders = await this._loadAllOrders();
      const clientOrders = allOrders[clientEmail] || [];

      // Convert to ChangeOrder instances and reverse (newest first)
      return clientOrders
        .map(data => ChangeOrder.fromJSON(data))
        .reverse();
    } catch (error) {
      logError('ChangeOrderHistory.getAllForClient: Error', error);
      return [];
    }
  }

  /**
   * Save change order to client's history
   * Enforces 50-order limit per client with FIFO deletion
   * @param {ChangeOrder} changeOrder - Change order to save
   * @returns {Promise<boolean>} True if saved successfully
   */
  async save(changeOrder) {
    try {
      if (!changeOrder || !(changeOrder instanceof ChangeOrder)) {
        logError('ChangeOrderHistory.save: Invalid changeOrder', { changeOrder });
        return false;
      }

      // Validate change order before saving
      const validation = changeOrder.validate();
      if (!validation.valid) {
        logError('ChangeOrderHistory.save: Validation failed', {
          errors: validation.errors
        });
        return false;
      }

      const clientEmail = changeOrder.clientEmail;
      const allOrders = await this._loadAllOrders();

      // Get or create client's order list
      if (!allOrders[clientEmail]) {
        allOrders[clientEmail] = [];
      }

      // Add new order to end (chronological order)
      allOrders[clientEmail].push(changeOrder.toJSON());

      // Enforce FIFO deletion if exceeds limit
      if (allOrders[clientEmail].length > MAX_ORDERS_PER_CLIENT) {
        const removed = allOrders[clientEmail].shift(); // Remove oldest
        logInfo('ChangeOrderHistory.save: FIFO deletion applied', {
          clientEmail,
          removedOrderId: removed.id,
          totalOrders: allOrders[clientEmail].length
        });
      }

      // Save to storage
      await this._saveAllOrders(allOrders);

      logInfo('ChangeOrderHistory.save: Change order saved', {
        clientEmail,
        changeOrderId: changeOrder.id,
        totalOrders: allOrders[clientEmail].length
      });

      return true;
    } catch (error) {
      logError('ChangeOrderHistory.save: Error saving', error);
      return false;
    }
  }

  /**
   * Get total number of change orders for a client
   * @param {string} clientEmail - Client email address
   * @returns {Promise<number>} Count of change orders
   */
  async getCountForClient(clientEmail) {
    try {
      const allOrders = await this._loadAllOrders();
      return (allOrders[clientEmail] || []).length;
    } catch (error) {
      logError('ChangeOrderHistory.getCountForClient: Error', error);
      return 0;
    }
  }

  /**
   * Get all unique client emails with change orders
   * @returns {Promise<string[]>} Array of client emails
   */
  async getAllClients() {
    try {
      const allOrders = await this._loadAllOrders();
      return Object.keys(allOrders);
    } catch (error) {
      logError('ChangeOrderHistory.getAllClients: Error', error);
      return [];
    }
  }

  /**
   * Delete all change orders for a specific client
   * @param {string} clientEmail - Client email address
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async deleteAllForClient(clientEmail) {
    try {
      const allOrders = await this._loadAllOrders();

      if (allOrders[clientEmail]) {
        delete allOrders[clientEmail];
        await this._saveAllOrders(allOrders);

        logInfo('ChangeOrderHistory.deleteAllForClient: Deleted all orders', {
          clientEmail
        });
      }

      return true;
    } catch (error) {
      logError('ChangeOrderHistory.deleteAllForClient: Error', error);
      return false;
    }
  }

  /**
   * Clear all change order history (all clients)
   * @returns {Promise<boolean>} True if cleared successfully
   */
  async clearAll() {
    try {
      await chrome.storage.local.remove(STORAGE_KEY);
      logInfo('ChangeOrderHistory.clearAll: All history cleared');
      return true;
    } catch (error) {
      logError('ChangeOrderHistory.clearAll: Error', error);
      return false;
    }
  }

  /**
   * Load all orders from storage (indexed by clientEmail)
   * @private
   * @returns {Promise<Object>} Object with clientEmail as keys, arrays of orders as values
   */
  async _loadAllOrders() {
    try {
      const result = await chrome.storage.local.get(STORAGE_KEY);
      return result[STORAGE_KEY] || {};
    } catch (error) {
      logError('ChangeOrderHistory._loadAllOrders: Error', error);
      return {};
    }
  }

  /**
   * Save all orders to storage
   * @private
   * @param {Object} allOrders - Object with clientEmail as keys
   * @returns {Promise<void>}
   */
  async _saveAllOrders(allOrders) {
    try {
      await chrome.storage.local.set({
        [STORAGE_KEY]: allOrders
      });
    } catch (error) {
      // Handle storage quota exceeded
      if (error.message && error.message.includes('QUOTA_BYTES')) {
        logError('ChangeOrderHistory._saveAllOrders: Storage quota exceeded', error);
        throw new Error('Storage quota exceeded. Please export and delete old change orders.');
      }
      throw error;
    }
  }
}

// Export singleton instance
const changeOrderHistoryInstance = new ChangeOrderHistoryService();
export default changeOrderHistoryInstance;

// Export class for testing
export { ChangeOrderHistoryService, MAX_ORDERS_PER_CLIENT };
