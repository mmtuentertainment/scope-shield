// T036-T040: Settings Storage Service

import { FreelancerSettings } from './FreelancerSettings.js';
import { STORAGE_KEYS } from './StorageSchemas.js';
import { logInfo, logError } from '../utils/Logger.js';

/**
 * Settings Storage Service
 * Handles CRUD operations for FreelancerSettings in chrome.storage.local
 */
export class SettingsStorage {
  /**
   * T037: Load settings from chrome.storage.local
   * @returns {Promise<FreelancerSettings>} Settings instance
   */
  static async get() {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.local.get([STORAGE_KEYS.SETTINGS], (result) => {
          if (chrome.runtime.lastError) {
            logError('Failed to load settings', chrome.runtime.lastError);
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }

          const settingsData = result[STORAGE_KEYS.SETTINGS];

          if (settingsData) {
            try {
              logInfo('Settings loaded from storage');
              const settings = FreelancerSettings.fromJSON(settingsData);
              resolve(settings);
            } catch (parseError) {
              logError('Failed to parse stored settings, returning defaults', parseError);
              const defaults = FreelancerSettings.getDefaults();
              resolve(defaults);
            }
          } else {
            // T039: Return defaults for first-run
            logInfo('No settings found, returning defaults');
            const defaults = FreelancerSettings.getDefaults();
            resolve(defaults);
          }
        });
      } catch (error) {
        logError('Error in SettingsStorage.get()', error);
        reject(error);
      }
    });
  }

  /**
   * T038: Save settings to chrome.storage.local with validation
   * @param {FreelancerSettings} settings - Settings to save
   * @returns {Promise<void>}
   */
  static async save(settings) {
    return new Promise((resolve, reject) => {
      try {
        // Validate before saving
        const validation = settings.validate();
        if (!validation.valid) {
          const error = new Error(`Invalid settings: ${validation.errors.join(', ')}`);
          logError('Settings validation failed', validation.errors);
          reject(error);
          return;
        }

        const settingsData = settings.toJSON();
        const storageData = {
          [STORAGE_KEYS.SETTINGS]: settingsData
        };

        chrome.storage.local.set(storageData, () => {
          // T040: Handle storage quota exceeded
          if (chrome.runtime.lastError) {
            const errorMessage = chrome.runtime.lastError.message;

            if (errorMessage.includes('QUOTA_BYTES')) {
              const quotaError = new Error('Storage quota exceeded. Please export change order history to free space.');
              logError('Storage quota exceeded', quotaError);
              reject(quotaError);
            } else {
              logError('Failed to save settings', chrome.runtime.lastError);
              reject(new Error(errorMessage));
            }
            return;
          }

          logInfo('Settings saved successfully', settingsData);
          resolve();
        });
      } catch (error) {
        logError('Error in SettingsStorage.save()', error);
        reject(error);
      }
    });
  }

  /**
   * T039: Get default settings for first-run
   * @returns {FreelancerSettings} Default settings
   */
  static getDefaults() {
    return FreelancerSettings.getDefaults();
  }

  /**
   * Validate settings without saving
   * @param {FreelancerSettings} settings - Settings to validate
   * @returns {{valid: boolean, errors: string[]}}
   */
  static validate(settings) {
    return settings.validate();
  }

  /**
   * Clear all settings (for testing/debugging)
   * @returns {Promise<void>}
   */
  static async clear() {
    return new Promise((resolve, reject) => {
      chrome.storage.local.remove([STORAGE_KEYS.SETTINGS], () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        logInfo('Settings cleared');
        resolve();
      });
    });
  }
}
