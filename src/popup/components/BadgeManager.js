/**
 * Badge Manager
 *
 * Manages extension badge updates to display unacknowledged detection count.
 *
 * @module BadgeManager
 */

import { getUnacknowledgedCount } from '../../utils/storage.js';
import { logError } from '../../lib/utils/Logger.js';

/**
 * Badge Manager Class
 */
export class BadgeManager {
  /**
   * Update extension badge with unacknowledged count
   * @returns {Promise<void>}
   */
  async update() {
    try {
      const count = await getUnacknowledgedCount();

      chrome.runtime.sendMessage({
        type: 'UPDATE_BADGE',
        count: count
      });
    } catch (error) {
      logError('BadgeManager.update failed', error);
    }
  }

  /**
   * Clear badge (set to 0)
   * @returns {Promise<void>}
   */
  async clear() {
    try {
      chrome.runtime.sendMessage({
        type: 'UPDATE_BADGE',
        count: 0
      });
    } catch (error) {
      logError('BadgeManager.clear failed', error);
    }
  }
}
