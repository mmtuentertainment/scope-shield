/**
 * Change Order Pre-Filler
 *
 * Handles loading freelancer name and original scope from settings
 * and history to pre-fill change order data.
 *
 * @module ChangeOrderPreFiller
 */

import { SettingsStorage } from '../storage/SettingsStorage.js';
import changeOrderHistory from './ChangeOrderHistory.js';
import { sanitizeText } from '../utils/Sanitizer.js';
import { logInfo, logError } from '../utils/Logger.js';

/**
 * Load freelancer name from settings or options
 *
 * @param {Object} options - Generation options
 * @returns {Promise<string>} Freelancer name
 */
export async function loadFreelancerName(options) {
  // Check options first
  if (options.freelancerName && options.freelancerName.trim() !== '') {
    return sanitizeText(options.freelancerName).trim();
  }

  // Load from settings
  try {
    const settings = await SettingsStorage.get();

    if (settings && settings.freelancerName && settings.freelancerName.trim() !== '') {
      return sanitizeText(settings.freelancerName).trim();
    }
  } catch (error) {
    logError('ChangeOrderPreFiller.loadFreelancerName: Error loading settings', error);
  }

  // Return placeholder - UI will prompt user to set this
  return 'Your Name'; // Placeholder
}

/**
 * Load original scope from history for client
 *
 * @param {string} clientEmail - Client email
 * @param {Object} options - Generation options
 * @returns {Promise<string>} Original scope or empty string
 */
export async function loadOriginalScope(clientEmail, options) {
  // Check options first
  if (options.originalScope && options.originalScope.trim() !== '') {
    return sanitizeText(options.originalScope).trim();
  }

  // Load from history
  try {
    const lastOrder = await changeOrderHistory.getLastForClient(clientEmail);

    if (lastOrder && lastOrder.originalScope && lastOrder.originalScope.trim() !== '') {
      logInfo('ChangeOrderPreFiller.loadOriginalScope: Pre-filled from history', {
        clientEmail,
        lastOrderId: lastOrder.id
      });
      return lastOrder.originalScope;
    }
  } catch (error) {
    logError('ChangeOrderPreFiller.loadOriginalScope: Error loading history', error);
  }

  // Return empty for first-time clients (user will fill)
  return '';
}
