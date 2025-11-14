/**
 * Format Helpers
 *
 * Utility functions for formatting timestamps and other data
 * for popup UI display.
 *
 * @module FormatHelpers
 */

/**
 * Format timestamp as relative time (e.g., "5m ago", "2d ago")
 * @param {number} timestamp - Unix timestamp in milliseconds since epoch
 * @returns {string} Formatted relative time
 */
export function formatRelativeTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;

  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return minutes === 0 ? 'Just now' : `${minutes}m ago`;
  }

  // Less than 24 hours
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}h ago`;
  }

  // Less than 7 days
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days}d ago`;
  }

  // Format date for >7 days old
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
