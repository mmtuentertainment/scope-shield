// T061: First Run Detector

import { SettingsStorage } from '../storage/SettingsStorage.js';

/**
 * First Run Detector
 * Determines if this is the user's first time using the extension
 */
export class FirstRunDetector {
  /**
   * Check if this is the first run (freelancerName is empty)
   * @returns {Promise<boolean>} True if first run, false otherwise
   */
  static async isFirstRun() {
    try {
      const settings = await SettingsStorage.get();

      // Consider it first run if freelancerName is empty or whitespace-only
      const isFirst = !settings.freelancerName || settings.freelancerName.trim() === '';

      return isFirst;
    } catch (error) {
      console.error('[FirstRunDetector] Error checking first run:', error);
      // Default to false if there's an error
      return false;
    }
  }

  /**
   * Mark first run as complete by saving freelancer name
   * @param {string} freelancerName - User's name
   * @returns {Promise<void>}
   */
  static async completeFirstRun(freelancerName) {
    try {
      const settings = await SettingsStorage.get();
      settings.freelancerName = freelancerName;
      await SettingsStorage.save(settings);
    } catch (error) {
      console.error('[FirstRunDetector] Error completing first run:', error);
      throw error;
    }
  }
}
