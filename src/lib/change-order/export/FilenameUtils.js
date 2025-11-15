// Filename Utilities
// Shared utilities for generating safe filenames

/**
 * Sanitize client name for use in filenames
 * @param {string} clientName - Client name to sanitize
 * @param {number} maxLength - Maximum length (default 50)
 * @returns {string} Sanitized client name
 */
export function sanitizeClientName(clientName = 'Client', maxLength = 50) {
  const truncated = clientName.slice(0, maxLength);
  return truncated
    .replace(/[^a-zA-Z0-9-_\s]/g, '_') // Replace unsafe chars with underscore
    .replace(/\s+/g, '_')               // Replace spaces with underscore
    .replace(/_{2,}/g, '_')             // Collapse multiple underscores
    .replace(/^_|_$/g, '');              // Trim underscores
}

/**
 * Format date for filename
 * @param {string} date - Date string or undefined
 * @returns {string} Formatted date (YYYY-MM-DD)
 */
export function formatFilenameDate(date) {
  return date || new Date().toISOString().split('T')[0];
}

/**
 * Generate change order filename
 * @param {Object} metadata - File metadata
 * @param {string} metadata.clientName - Client name
 * @param {string} metadata.date - Date (YYYY-MM-DD)
 * @param {string} extension - File extension (e.g., 'txt', 'pdf')
 * @returns {string} Complete filename
 */
export function generateChangeOrderFilename(metadata, extension) {
  const { clientName = 'Client', date } = metadata;
  const safeClient = sanitizeClientName(clientName);
  const safeDate = formatFilenameDate(date);
  return `ChangeOrder_${safeClient}_${safeDate}.${extension}`;
}
