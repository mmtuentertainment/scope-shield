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
 * Show notification message
 *
 * @param {string} elementId - ID of notification element
 * @param {string} message - Notification message
 * @param {string} type - Notification type ('success', 'error', 'warning', 'info')
 * @param {number} [duration=5000] - Auto-hide duration in milliseconds
 * @param {string} [classPrefix='export-notification'] - CSS class prefix for styling
 * @returns {number|null} Timeout ID for cleanup, or null if element not found
 */
export function showNotification(
  elementId,
  message,
  type = 'info',
  duration = 5000,
  classPrefix = 'export-notification'
) {
  const notification = document.getElementById(elementId);
  if (!notification) return null;

  // Set notification content and style
  notification.textContent = message;
  notification.className = `${classPrefix} ${classPrefix}-${type}`;
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
 * Hide notification
 *
 * @param {string} elementId - ID of notification element
 * @param {number} [timeoutId] - Optional timeout ID to clear
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
