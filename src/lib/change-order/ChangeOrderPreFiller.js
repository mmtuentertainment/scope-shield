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
 * Obtain a freelancer name to pre-fill change orders.
 *
 * @param {Object} options - Options that may include `freelancerName`; when present and non-empty it is used.
 * @returns {string} The freelancer name to use; sanitized and trimmed when sourced from options or settings, or the placeholder `'Your Name'` if none is available.
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
 * Prefills the original scope for a client from provided options or change-order history.
 *
 * If options.originalScope is provided and non-empty, it is sanitized and returned. Otherwise the function attempts to load the most recent change order for the given client and returns that order's original scope if available.
 *
 * @param {string} clientEmail - Client email used to look up the most recent change order.
 * @param {Object} options - Generation options; may include `originalScope`.
 * @returns {string} The original scope when available, otherwise an empty string.
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