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

                // Phase 8 (T275-T280): Enhanced quota exceeded handling (CodeRabbit: Guard string type)
                if (typeof errorMessage === 'string' && errorMessage.includes('QUOTA_BYTES')) {
                  logError('Storage quota exceeded', new Error(errorMessage));
                  // Reject with special quota error for UI handling
                  const quotaError = new Error('Storage quota exceeded');
                  quotaError.name = 'QuotaExceededError';
                  quotaError.needsCSVExport = true; // Signal to show CSV export button
                  quotaError.historyCount = history.length;
                  reject(quotaError);
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

  /**
   * Export history to CSV file (Phase 8: T275-T280)
   * Used when storage quota is exceeded to free up space
   * @returns {Promise<{success: boolean, filename?: string, error?: string}>}
   */
  static async exportToCSV() {
    try {
      // Get all history
      const history = await ExportHistoryStorage.getAll();

      if (history.length === 0) {
        return {
          success: false,
          error: 'No export history to export'
        };
      }

      // Build CSV content
      const headers = ['Export ID', 'Method', 'Client Name', 'Freelancer Name', 'Total Cost', 'Exported At', 'Duration (ms)'];
      const csvRows = [headers.join(',')];

      // CodeRabbit CRITICAL: Sanitize for CSV injection and newline handling
      const sanitizeCSV = (str) => {
        if (!str) return '';
        // Remove newlines
        let cleaned = str.replace(/[\r\n]+/g, ' ');
        // Prefix formula characters with single quote to prevent execution
        if (/^[=+\-@]/.test(cleaned)) {
          cleaned = "'" + cleaned;
        }
        return cleaned.replace(/"/g, '""');
      };

      for (const entry of history) {
        const row = [
          entry.id || '',
          entry.method || '',
          `"${sanitizeCSV(entry.clientName)}"`,
          `"${sanitizeCSV(entry.freelancerName)}"`,
          entry.totalCost || 0,
          entry.exportedAt || '',
          entry.duration || 0
        ];
        csvRows.push(row.join(','));
      }

      const csvContent = csvRows.join('\n');

      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `ScopeShield_Export_History_${timestamp}.csv`;

      // Create and trigger download (CodeRabbit: Append to DOM for browser compatibility)
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Cleanup
      URL.revokeObjectURL(url);

      logInfo(`ExportHistoryStorage: Exported ${history.length} entries to ${filename}`);

      return {
        success: true,
        filename
      };

    } catch (error) {
      logError('ExportHistoryStorage: CSV export failed', error);
      return {
        success: false,
        error: `Failed to export CSV: ${error.message}`
      };
    }
  }

  /**
   * Check available storage quota
   * Phase 8 (T275-T280): Proactive quota monitoring
   * @returns {Promise<{available: number, total: number, percentUsed: number}>}
   */
  static async checkQuota() {
    try {
      // Check if storage quota API is available
      if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        const totalQuota = estimate.quota || 0; // CodeRabbit: Rename for clarity
        const used = estimate.usage || 0;
        const percentUsed = totalQuota > 0 ? (used / totalQuota) * 100 : 0;

        return {
          available: totalQuota - used,
          total: totalQuota,
          percentUsed
        };
      }

      // Fallback for browsers without quota API
      return {
        available: -1,
        total: -1,
        percentUsed: 0
      };

    } catch (error) {
      logWarning('Failed to check storage quota', error);
      return {
        available: -1,
        total: -1,
        percentUsed: 0
      };
    }
  }
}
