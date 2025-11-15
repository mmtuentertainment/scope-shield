/**
 * Chrome storage wrapper utility for ScopeShield
 * Handles DetectionEvent storage with quota management
 */

import { logError, logWarning, logInfo } from '../lib/utils/Logger.js';

/**
 * Save a detection event to chrome.storage.local
 * @param {Object} event - The DetectionEvent to save
 */
export async function saveDetectionEvent(event) {
  return saveDetectionEvents([event]);
}

/**
 * Save multiple detection events atomically (prevents race conditions)
 * @param {Object[]} events - Array of DetectionEvents to save
 */
export async function saveDetectionEvents(events) {
  if (!events || events.length === 0) {
    return;
  }

  try {
    // Validate all events
    for (const event of events) {
      if (!event || !event.id || !event.timestamp) {
        logError('Invalid event: missing required fields (id, timestamp)', event);
        throw new Error('Invalid event: missing required fields (id, timestamp)');
      }
    }

    // Atomic read-modify-write (prevents race condition)
    const { detectionEvents = [] } = await chrome.storage.local.get('detectionEvents');

    // Add all new events
    detectionEvents.push(...events);

    // Quota management
    await manageQuota(detectionEvents);

    // Save updated array
    await chrome.storage.local.set({ detectionEvents });

    logInfo(`Saved ${events.length} detection event(s)`);
  } catch (error) {
    logError('Failed to save detection events', error);
    throw error;
  }
}

/**
 * Get all detection events from storage
 * @returns {Array} Array of DetectionEvent objects
 */
export async function getDetectionEvents() {
  try {
    const { detectionEvents = [] } = await chrome.storage.local.get('detectionEvents');

    // Sort by timestamp (most recent first)
    const sortedEvents = detectionEvents.sort((a, b) =>
      new Date(b.timestamp) - new Date(a.timestamp)
    );

    return sortedEvents;
  } catch (error) {
    logError('Failed to get detection events', error);
    return [];
  }
}

/**
 * Update acknowledged status of an event
 * @param {string} eventId - The event ID to update
 * @param {boolean} acknowledged - The new acknowledged status
 */
export async function updateEventAcknowledged(eventId, acknowledged = true) {
  try {
    const { detectionEvents = [] } = await chrome.storage.local.get('detectionEvents');

    const event = detectionEvents.find(e => e.id === eventId);
    if (event) {
      event.acknowledged = acknowledged;
      await chrome.storage.local.set({ detectionEvents });
      logInfo(`Updated event ${eventId} acknowledged: ${acknowledged}`);
      return true;
    } else {
      logWarning(`Event ${eventId} not found`);
      return false;
    }
  } catch (error) {
    logError('Failed to update event acknowledged', error);
    return false;
  }
}

/**
 * Acknowledge an event (alias for updateEventAcknowledged)
 * @param {string} eventId - The event ID to acknowledge
 */
export async function acknowledgeEvent(eventId) {
  return updateEventAcknowledged(eventId, true);
}

/**
 * Get unacknowledged event count
 * @returns {number} Count of unacknowledged events
 */
export async function getUnacknowledgedCount() {
  try {
    const { detectionEvents = [] } = await chrome.storage.local.get('detectionEvents');
    return detectionEvents.filter(e => !e.acknowledged).length;
  } catch (error) {
    logError('Failed to get unacknowledged count', error);
    return 0;
  }
}

/**
 * Group events by thread ID
 * @returns {Object} Events grouped by threadId
 */
export async function getEventsByThread() {
  try {
    const events = await getDetectionEvents();

    const eventsByThread = events.reduce((acc, event) => {
      if (!acc[event.threadId]) {
        acc[event.threadId] = [];
      }
      acc[event.threadId].push(event);
      return acc;
    }, {});

    return eventsByThread;
  } catch (error) {
    logError('Failed to group events by thread', error);
    return {};
  }
}

/**
 * Manage storage quota with FIFO rotation
 * @param {Array} detectionEvents - Current events array
 */
async function manageQuota(detectionEvents) {
  try {
    const bytesInUse = await chrome.storage.local.getBytesInUse();
    const quotaPct = (bytesInUse / 5242880) * 100; // 5MB = 5242880 bytes

    if (quotaPct > 80) {
      // FIFO: Remove oldest 200 events
      const removedCount = Math.min(200, Math.floor(detectionEvents.length * 0.25));
      detectionEvents.splice(0, removedCount);
      logInfo(`Quota at ${quotaPct.toFixed(1)}% - Rotated ${removedCount} oldest events`);
    }
  } catch (error) {
    logError('Failed to manage quota', error);
  }
}

/**
 * Clear all detection events (for testing/reset)
 */
export async function clearAllEvents() {
  try {
    await chrome.storage.local.remove('detectionEvents');
    logInfo('Cleared all detection events');
  } catch (error) {
    logError('Failed to clear events', error);
  }
}
