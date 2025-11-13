/**
 * Pricing Calculator Settings Integration
 *
 * Handles loading and saving hourly rate to user settings
 * for the PricingCalculatorWidget component.
 *
 * @module PricingCalculatorSettings
 */

import { SettingsStorage } from '../../lib/storage/SettingsStorage.js';
import { logInfo, logError } from '../../lib/utils/Logger.js';

/**
 * Load hourly rate from settings
 *
 * @returns {Promise<number|null>} Hourly rate from settings, or null if not found
 */
export async function loadHourlyRate() {
  try {
    const settingsStorage = new SettingsStorage();
    const settings = await settingsStorage.get();

    if (settings && settings.hourlyRate && settings.hourlyRate > 0) {
      logInfo('PricingCalculatorSettings.loadHourlyRate: Rate loaded', {
        hourlyRate: settings.hourlyRate
      });
      return settings.hourlyRate;
    }

    return null;
  } catch (error) {
    logError('PricingCalculatorSettings.loadHourlyRate: Failed', error);
    return null; // Continue with empty rate - user can enter manually
  }
}

/**
 * Save hourly rate to settings for future use
 *
 * @param {number} hourlyRate - Rate to save
 * @returns {Promise<boolean>} True if saved successfully, false otherwise
 */
export async function saveHourlyRate(hourlyRate) {
  try {
    const settingsStorage = new SettingsStorage();
    const settings = await settingsStorage.get();

    // Update hourly rate
    settings.hourlyRate = hourlyRate;

    await settingsStorage.save(settings);

    logInfo('PricingCalculatorSettings.saveHourlyRate: Rate saved', {
      hourlyRate
    });

    return true;
  } catch (error) {
    logError('PricingCalculatorSettings.saveHourlyRate: Failed', error);
    return false; // Continue - calculation still works, just won't be remembered
  }
}
