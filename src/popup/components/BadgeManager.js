/**
 * Badge Manager
 *
 * Manages extension badge updates to display unacknowledged detection count.
 *
 * @module BadgeManager
 */

import { getUnacknowledgedCount } from '../../utils/storage.js';
import { logError } from '../../lib/utils/Logger.js';
import { debounce } from '../utils/debounce.js';

/**
 * Badge Manager Class
 */
export class BadgeManager {
  constructor() {
    // Debounce updates to prevent excessive messaging
    this.updateDebounced = debounce(this._update.bind(this), 100);
  }

  /**
   * Update extension badge with unacknowledged count (debounced)
   * @returns {Promise<void>}
   */
  async update() {
    return this.updateDebounced();
  }

  /**
   * Internal update method
   * @private
   * @returns {Promise<void>}
   */
  async _update() {
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
