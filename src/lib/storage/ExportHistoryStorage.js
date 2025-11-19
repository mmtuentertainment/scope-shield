/**
 * Export History Storage Service
 * Tracks export events for audit trail and user reference
 */

import { STORAGE_KEYS } from './StorageSchemas.js';
import { logInfo, logError, logWarning } from '../utils/Logger.js';
import { generateUUID } from '../../utils/uuid.js';

/**
 * Maximum number of history entries to retain (FIFO deletion)
 */
const MAX_HISTORY_ENTRIES = 100;

/**
 * ExportHistoryStorage - Service for managing export history
 * Provides audit trail of all change order exports
 */
export class ExportHistoryStorage {
  /**
   * Save export event to history
   * @param {Object} exportEvent - Export event data
   * @param {string} exportEvent.method - Export method ('pdf'|'clipboard'|'text')
   * @param {Object} exportEvent.metadata - Export metadata (clientName, freelancerName, etc.)
   * @param {number} [exportEvent.duration] - Optional export duration in milliseconds
   * @returns {Promise<void>}
   */
  static async save(exportEvent) {
    return new Promise((resolve, reject) => {
      try {
        // Validate export event
        if (!exportEvent || !exportEvent.method) {
          const error = new Error('Invalid export event: missing method');
          logError('Export history save failed', error);
          reject(error);
          return;
        }

        // Get existing history
        chrome.storage.local.get([STORAGE_KEYS.EXPORT_HISTORY], (result) => {
          if (chrome.runtime.lastError) {
            logError('Failed to load export history', chrome.runtime.lastError);
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }

          const history = result[STORAGE_KEYS.EXPORT_HISTORY] || [];

          // Create entry
          const entry = {
            id: generateUUID(),
            method: exportEvent.method,
            clientName: exportEvent.metadata?.clientName || 'Unknown',
            freelancerName: exportEvent.metadata?.freelancerName || '',
            totalCost: exportEvent.metadata?.totalCost || 0,
            exportedAt: new Date().toISOString(),
            duration: exportEvent.duration || 0
          };

          // Add to beginning (most recent first)
          history.unshift(entry);

          // FIFO: Keep only last 100 entries
          if (history.length > MAX_HISTORY_ENTRIES) {
            const removed = history.splice(MAX_HISTORY_ENTRIES);
            logInfo(`Export history: removed ${removed.length} old entries (FIFO)`);
          }

          // Save updated history
          chrome.storage.local.set(
            { [STORAGE_KEYS.EXPORT_HISTORY]: history },
            () => {
              if (chrome.runtime.lastError) {
                const errorMessage = chrome.runtime.lastError.message;

                // Handle quota exceeded - emergency cleanup
                if (errorMessage.includes('QUOTA_BYTES')) {
                  logWarning('Storage quota exceeded, performing emergency cleanup');
                  // Keep only last 50 entries to free space
                  const reducedHistory = history.slice(0, 50);
                  chrome.storage.local.set(
                    { [STORAGE_KEYS.EXPORT_HISTORY]: reducedHistory },
                    () => {
                      if (chrome.runtime.lastError) {
                        logError('Emergency cleanup failed', chrome.runtime.lastError);
                        reject(new Error('Storage quota exceeded and cleanup failed'));
                      } else {
                        logInfo('Emergency cleanup succeeded, saved export with 50 entries');
                        resolve();
                      }
                    }
                  );
                } else {
                  logError('Failed to save export history', chrome.runtime.lastError);
                  reject(new Error(errorMessage));
                }
                return;
              }

              logInfo(`Export history saved (${history.length} entries)`);
              resolve();
            }
          );
        });
      } catch (error) {
        logError('Error in ExportHistoryStorage.save()', error);
        reject(error);
      }
    });
  }

  /**
   * Get all export history entries
   * @returns {Promise<Array>} Array of export history entries (most recent first)
   */
  static async getAll() {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.local.get([STORAGE_KEYS.EXPORT_HISTORY], (result) => {
          if (chrome.runtime.lastError) {
            logError('Failed to load export history', chrome.runtime.lastError);
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }

          const history = result[STORAGE_KEYS.EXPORT_HISTORY] || [];
          resolve(history);
        });
      } catch (error) {
        logError('Error in ExportHistoryStorage.getAll()', error);
        reject(error);
      }
    });
  }

  /**
   * Get export history entries for a specific client
   * @param {string} clientName - Client name to filter by
   * @returns {Promise<Array>} Filtered export history entries
   */
  static async getByClient(clientName) {
    try {
      const allHistory = await ExportHistoryStorage.getAll();
      const normalizedSearch = clientName.toLowerCase().trim();

      return allHistory.filter(entry =>
        entry.clientName.toLowerCase().includes(normalizedSearch)
      );
    } catch (error) {
      logError('Error in ExportHistoryStorage.getByClient()', error);
      throw error;
    }
  }

  /**
   * Clean oldest N entries from history (for quota management)
   * @param {number} count - Number of oldest entries to remove
   * @returns {Promise<number>} Number of entries actually removed
   */
  static async cleanOldest(count = 50) {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.local.get([STORAGE_KEYS.EXPORT_HISTORY], (result) => {
          if (chrome.runtime.lastError) {
            logError('Failed to load export history for cleanup', chrome.runtime.lastError);
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }

          const history = result[STORAGE_KEYS.EXPORT_HISTORY] || [];

          if (history.length <= count) {
            // Don't remove all entries, keep at least some history
            logInfo('Export history: not enough entries to clean');
            resolve(0);
            return;
          }

          // Remove oldest N entries
          const originalLength = history.length;
          const cleaned = history.splice(-count, count);

          chrome.storage.local.set(
            { [STORAGE_KEYS.EXPORT_HISTORY]: history },
            () => {
              if (chrome.runtime.lastError) {
                logError('Failed to save cleaned history', chrome.runtime.lastError);
                reject(new Error(chrome.runtime.lastError.message));
                return;
              }

              logInfo(`Cleaned ${cleaned.length} oldest export history entries`);
              resolve(cleaned.length);
            }
          );
        });
      } catch (error) {
        logError('Error in ExportHistoryStorage.cleanOldest()', error);
        reject(error);
      }
    });
  }

  /**
   * Clear all export history (for testing or user request)
   * @returns {Promise<void>}
   */
  static async clear() {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.local.set(
          { [STORAGE_KEYS.EXPORT_HISTORY]: [] },
          () => {
            if (chrome.runtime.lastError) {
              logError('Failed to clear export history', chrome.runtime.lastError);
              reject(new Error(chrome.runtime.lastError.message));
              return;
            }

            logInfo('Export history cleared');
            resolve();
          }
        );
      } catch (error) {
        logError('Error in ExportHistoryStorage.clear()', error);
        reject(error);
      }
    });
  }
}
