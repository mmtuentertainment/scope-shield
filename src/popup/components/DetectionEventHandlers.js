/**
 * Detection Event Handlers
 *
 * Processes user interactions with detection items:
 * - Acknowledge individual detections
 * - View detection in Gmail
 * - Copy detection to clipboard
 * - Clear all detections
 * - Generate change order report
 *
 * @module DetectionEventHandlers
 */

import { acknowledgeEvent, clearAllEvents } from '../../utils/storage.js';
import { showNotification } from './NotificationManager.js';
import { logError } from '../../lib/utils/Logger.js';
import { ChangeOrderBuilder } from '../../lib/change-order/ChangeOrderBuilder.js';

/**
 * Detection Event Handlers Class
 */
export class DetectionEventHandlers {
  /**
   * Create event handlers instance
   * @param {Object} options - Configuration options
   * @param {Function} options.getEvents - Function to get current events array
   * @param {Function} options.onEventsChanged - Callback when events change
   */
  constructor(options) {
    this.getEvents = options.getEvents;
    this.onEventsChanged = options.onEventsChanged;
  }

  /**
   * Handle acknowledge button click
   * @param {string} eventId - Event ID to acknowledge
   */
  async handleAcknowledge(eventId) {
    try {
      await acknowledgeEvent(eventId);
      this.updateLocalState(eventId);
      this.updateDOMElement(eventId);
      this.onEventsChanged();
    } catch (error) {
      logError('DetectionEventHandlers.handleAcknowledge failed', error);
    }
  }

  /**
   * Update local state for acknowledged event
   * @private
   * @param {string} eventId - Event ID
   */
  updateLocalState(eventId) {
    const event = this.getEvents().find(e => e.id === eventId);
    if (event) {
      event.acknowledged = true;
    }
  }

  /**
   * Update DOM element visual state
   * @private
   * @param {string} eventId - Event ID
   */
  updateDOMElement(eventId) {
    const itemEl = document.querySelector(`[data-id="${eventId}"]`);
    if (itemEl) {
      itemEl.classList.add('acknowledged');
    }
  }

  /**
   * Handle view button click
   * @param {string} url - Gmail URL to open
   */
  handleView(url) {
    if (url) {
      chrome.tabs.create({ url });
    }
  }

  /**
   * Handle copy button click
   * @param {Object} event - Detection event to copy
   */
  async handleCopy(event) {
    const text = `Scope Creep Detected:
From: ${event.senderName || event.sender}
Text: ${event.detectedText}
Trigger: ${event.triggerWord} (Confidence: ${event.triggerWeight}/10)
Time: ${new Date(event.timestamp).toLocaleString()}`;

    try {
      await navigator.clipboard.writeText(text);
      showNotification('toast-notification', 'Copied to clipboard!', 'success', 3000);
    } catch (error) {
      logError('DetectionEventHandlers.handleCopy failed', error);
      showNotification('toast-notification', 'Failed to copy', 'error', 3000);
    }
  }

  /**
   * Handle clear all button click
   */
  async handleClearAll() {
    if (!confirm('Clear all detection history? This cannot be undone.')) {
      return;
    }

    try {
      await clearAllEvents();
      this.onEventsChanged();
      showNotification('toast-notification', 'All detections cleared', 'success', 3000);
    } catch (error) {
      logError('DetectionEventHandlers.handleClearAll failed', error);
      showNotification('toast-notification', 'Failed to clear detections', 'error', 3000);
    }
  }

  /**
   * Generate change order report using ChangeOrderBuilder
   */
  async generateReport() {
    const unacknowledged = this.getEvents().filter(e => !e.acknowledged);

    if (unacknowledged.length === 0) {
      showNotification('toast-notification', 'No unacknowledged detections to report', 'info', 3000);
      return;
    }

    try {
      // Transform events to detection format
      const detections = unacknowledged.map(event => ({
        sender: event.senderName || event.sender,
        text: event.detectedText,
        trigger: event.triggerWord,
        date: event.timestamp
      }));

      // Build professional change order
      const builder = new ChangeOrderBuilder();
      const report = await builder.build(detections);

      // Copy to clipboard
      await navigator.clipboard.writeText(report);
      showNotification('toast-notification', 'Change order copied to clipboard!', 'success', 3000);

      // Mark all as acknowledged
      await this.acknowledgeMultipleEvents(unacknowledged);

      this.onEventsChanged();
    } catch (error) {
      logError('DetectionEventHandlers.generateReport failed', error);
      showNotification('toast-notification', 'Failed to generate report', 'error', 3000);
    }
  }

  /**
   * Acknowledge multiple events in batch
   * @param {Array} events - Events to acknowledge
   * @returns {Promise<void>}
   */
  async acknowledgeMultipleEvents(events) {
    const promises = events.map(event => acknowledgeEvent(event.id));
    const results = await Promise.allSettled(promises);

    // Log and notify user of failures
    const failures = results.filter(r => r.status === 'rejected');
    if (failures.length > 0) {
      console.warn(`[ScopeShield] ${failures.length} events failed to acknowledge:`, failures);
      showNotification('toast-notification',
        `${failures.length} items failed to acknowledge`,
        'warning',
        5000
      );
    }

    // Mark all as acknowledged locally
    events.forEach(event => {
      event.acknowledged = true;
    });
  }
}
