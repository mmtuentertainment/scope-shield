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
import { logError, logWarning } from '../../lib/utils/Logger.js';
import { ChangeOrderBuilder } from '../../lib/change-order/ChangeOrderBuilder.js';
import { ChangeOrderModal } from './ChangeOrderModal.js';
import { SettingsStorage } from '../../lib/storage/SettingsStorage.js';

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
    if (typeof eventId !== 'string' || eventId.trim() === '') {
      logError('DetectionEventHandlers.handleAcknowledge: Invalid eventId', new TypeError('eventId must be a non-empty string'));
      return;
    }

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
    if (!url || typeof url !== 'string') {
      logError('DetectionEventHandlers.handleView: Invalid URL', new TypeError('URL must be a non-empty string'));
      showNotification('toast-notification', 'Unable to open email (invalid URL)', 'error', 3000);
      return;
    }

    // Validate URL format
    try {
      const urlObj = new URL(url);
      // Only allow http and https protocols for security
      if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
        logError('DetectionEventHandlers.handleView: Invalid protocol', new Error(`Only http/https allowed, got ${urlObj.protocol}`));
        showNotification('toast-notification', 'Unable to open email (invalid link)', 'error', 3000);
        return;
      }
      chrome.tabs.create({ url });
    } catch (error) {
      logError('DetectionEventHandlers.handleView: Malformed URL', error);
      showNotification('toast-notification', 'Unable to open email (malformed URL)', 'error', 3000);
    }
  }

  /**
   * Handle copy button click
   * @param {Object} event - Detection event to copy
   */
  async handleCopy(event) {
    if (!event || typeof event !== 'object') {
      logError('DetectionEventHandlers.handleCopy: Invalid event', new TypeError('Event must be an object'));
      showNotification('toast-notification', 'Failed to copy', 'error', 3000);
      return;
    }

    const text = `Scope Creep Detected:
From: ${event.senderName || event.sender || 'Unknown'}
Text: ${event.detectedText || ''}
Trigger: ${event.triggerWord || 'Unknown'} (Confidence: ${event.triggerWeight || 0}/10)
Time: ${event.timestamp ? new Date(event.timestamp).toLocaleString() : 'Unknown'}`;

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
   * Generate change order report and show modal with calculator and export options
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

      // Load freelancer settings
      const settings = await SettingsStorage.get();

      // Build professional change order
      const builder = new ChangeOrderBuilder();
      const document = await builder.build(detections, settings);

      // Extract metadata for export
      const metadata = {
        clientName: detections[0]?.sender || 'Client',
        freelancerName: settings.freelancerName || '',
        date: new Date().toISOString().split('T')[0]
      };

      // Calculator options
      const calculatorOptions = {
        hourlyRate: settings.hourlyRate || 0,
        estimatedHours: builder.estimateHours(detections),
        onRecalculate: async (newRate, newHours) => {
          // Rebuild document with new pricing AND custom hours
          const updatedSettings = { ...settings, hourlyRate: newRate };
          return await builder.build(detections, updatedSettings, newHours);
        }
      };

      // Show modal with calculator and export controls
      const modal = new ChangeOrderModal(document, metadata, calculatorOptions);
      modal.show();

      // Mark all as acknowledged after modal is shown
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
      logWarning(`${failures.length} events failed to acknowledge`, failures);
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
