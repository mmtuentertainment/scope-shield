/**
 * Draft Storage Service
 * Handles persistence of change order drafts for recovery on popup reopen
 */

import { STORAGE_KEYS } from '../storage/StorageSchemas.js';
import { logInfo, logError, logWarning } from '../utils/Logger.js';

/**
 * Maximum age for drafts (7 days in milliseconds)
 */
const MAX_DRAFT_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * DraftStorage - Service for managing change order drafts
 * Provides auto-save functionality to prevent data loss when popup closes
 */
export class DraftStorage {
  /**
   * Save draft to chrome.storage.local
   * @param {Object} draftData - Draft data to save
   * @param {string} draftData.changeOrderText - Change order document text
   * @param {Object} draftData.metadata - Document metadata (clientName, freelancerName, date)
   * @param {Object} draftData.calculatorState - Calculator state (hourlyRate, estimatedHours)
   * @returns {Promise<void>}
   */
  static async save(draftData) {
    return new Promise((resolve, reject) => {
      try {
        // Validate draft structure
        if (!draftData || !draftData.changeOrderText) {
          const error = new Error('Invalid draft: missing changeOrderText');
          logError('Draft validation failed', error);
          reject(error);
          return;
        }

        // Add timestamp if not present
        const draft = {
          ...draftData,
          savedAt: draftData.savedAt || new Date().toISOString()
        };

        // Save to storage
        chrome.storage.local.set(
          { [STORAGE_KEYS.DRAFT]: draft },
          () => {
            if (chrome.runtime.lastError) {
              const errorMessage = chrome.runtime.lastError.message;

              // Handle quota exceeded
              if (errorMessage.includes('QUOTA_BYTES')) {
                const quotaError = new Error('Storage quota exceeded. Draft could not be saved.');
                logError('Draft save failed: quota exceeded', quotaError);
                reject(quotaError);
              } else {
                logError('Draft save failed', chrome.runtime.lastError);
                reject(new Error(errorMessage));
              }
              return;
            }

            logInfo('Draft saved successfully');
            resolve();
          }
        );
      } catch (error) {
        logError('Error in DraftStorage.save()', error);
        reject(error);
      }
    });
  }

  /**
   * Load draft from chrome.storage.local
   * Auto-deletes drafts older than 7 days
   * @returns {Promise<Object|null>} Draft data or null if no valid draft exists
   */
  static async load() {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.local.get([STORAGE_KEYS.DRAFT], async (result) => {
          if (chrome.runtime.lastError) {
            logError('Failed to load draft', chrome.runtime.lastError);
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }

          const draft = result[STORAGE_KEYS.DRAFT];

          if (!draft) {
            resolve(null);
            return;
          }

          // Validate draft structure
          if (!draft.changeOrderText || !draft.metadata || !draft.calculatorState) {
            logWarning('Draft is missing required fields, deleting corrupted draft');
            await DraftStorage.delete();
            resolve(null);
            return;
          }

          // Check draft age
          if (draft.savedAt) {
            const age = Date.now() - new Date(draft.savedAt).getTime();

            if (age > MAX_DRAFT_AGE_MS) {
              logInfo(`Draft expired (${Math.floor(age / (24 * 60 * 60 * 1000))} days old), deleting`);
              await DraftStorage.delete();
              resolve(null);
              return;
            }
          }

          logInfo('Draft loaded successfully');
          resolve(draft);
        });
      } catch (error) {
        logError('Error in DraftStorage.load()', error);
        // Fail gracefully - return null instead of rejecting
        resolve(null);
      }
    });
  }

  /**
   * Delete draft from chrome.storage.local
   * @returns {Promise<void>}
   */
  static async delete() {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.local.remove([STORAGE_KEYS.DRAFT], () => {
          if (chrome.runtime.lastError) {
            logError('Failed to delete draft', chrome.runtime.lastError);
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }

          logInfo('Draft deleted successfully');
          resolve();
        });
      } catch (error) {
        logError('Error in DraftStorage.delete()', error);
        reject(error);
      }
    });
  }

  /**
   * Check if a valid draft exists
   * @returns {Promise<boolean>} True if draft exists and is valid
   */
  static async hasDraft() {
    try {
      const draft = await DraftStorage.load();
      return draft !== null;
    } catch (error) {
      logError('Error checking for draft', error);
      return false;
    }
  }

  /**
   * Clean old drafts (called on popup initialization)
   * Removes drafts older than maxAgeMs
   * @param {number} maxAgeMs - Maximum age in milliseconds (default: 7 days)
   * @returns {Promise<boolean>} True if draft was cleaned
   */
  static async cleanOldDrafts(maxAgeMs = MAX_DRAFT_AGE_MS) {
    try {
      const draft = await new Promise((resolve, reject) => {
        chrome.storage.local.get([STORAGE_KEYS.DRAFT], (result) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          resolve(result[STORAGE_KEYS.DRAFT]);
        });
      });

      if (!draft || !draft.savedAt) {
        return false;
      }

      const age = Date.now() - new Date(draft.savedAt).getTime();

      if (age > maxAgeMs) {
        await DraftStorage.delete();
        logInfo(`Cleaned old draft (${Math.floor(age / (24 * 60 * 60 * 1000))} days old)`);
        return true;
      }

      return false;
    } catch (error) {
      logError('Error cleaning old drafts', error);
      return false;
    }
  }
}
