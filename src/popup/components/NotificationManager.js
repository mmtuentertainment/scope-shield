/**
 * Notification Manager
 *
 * Shared utility for displaying toast/snackbar notifications.
 * Handles auto-hide and timeout management.
 *
 * @module NotificationManager
 */

import { logInfo } from '../../lib/utils/Logger.js';

/**
 * Display a toast-style notification in a DOM element and schedule it to auto-hide.
 *
 * @param {string} elementId - ID of the notification DOM element.
 * @param {string} message - Text to display inside the notification.
 * @param {string} type - Notification style: 'success', 'error', 'warning', or 'info'.
 * @param {number} [duration=5000] - Auto-hide delay in milliseconds.
 * @returns {?number} The timeout ID returned by setTimeout, or `null` if the element was not found.
 */
export function showNotification(elementId, message, type = 'info', duration = 5000) {
  const notification = document.getElementById(elementId);
  if (!notification) return null;

  // Set notification content and style
  notification.textContent = message;
  notification.className = `export-notification export-notification-${type}`;
  notification.style.display = 'block';

  logInfo('NotificationManager.showNotification: Notification shown', {
    message,
    type,
    duration
  });

  // Auto-hide after duration
  const timeoutId = setTimeout(() => {
    notification.style.display = 'none';
  }, duration);

  return timeoutId;
}

/**
 * Hide the notification element identified by the given ID and optionally clear a pending auto-hide timeout.
 *
 * If the element is not found, no DOM change is performed; the provided timeoutId is still cleared when present.
 * @param {string} elementId - ID of the notification DOM element to hide.
 * @param {number} [timeoutId] - Optional timeout identifier (from `setTimeout`) to clear.
 */
export function hideNotification(elementId, timeoutId = null) {
  const notification = document.getElementById(elementId);
  if (notification) {
    notification.style.display = 'none';
  }

  if (timeoutId) {
    clearTimeout(timeoutId);
  }
}