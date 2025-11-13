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
 * Retrieve the saved hourly rate from user settings.
 *
 * Attempts to read stored settings and returns the saved hourly rate when present and greater than zero.
 *
 * @returns {Promise<number|null>} The saved hourly rate when greater than 0, or `null` if no valid rate is stored or on error.
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
 * Persist the provided hourly rate in user settings for later use.
 *
 * @param {number} hourlyRate - Hourly rate to persist.
 * @returns {boolean} `true` if saved successfully, `false` otherwise.
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