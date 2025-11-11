/**
 * UUID generator utility
 * Generates UUID v4 for event IDs
 */

/**
 * Generate a UUID v4
 * @returns {string} UUID v4 string
 */
export function generateUUID() {
  // Use crypto.randomUUID if available (Chrome 92+)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback implementation for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Validate if a string is a valid UUID v4
 * @param {string} uuid - String to validate
 * @returns {boolean} True if valid UUID v4
 */
export function isValidUUID(uuid) {
  const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidV4Regex.test(uuid);
}

/**
 * Generate a short ID (for display purposes)
 * @param {string} uuid - Full UUID
 * @returns {string} Short ID (first 8 characters)
 */
export function getShortId(uuid) {
  return uuid ? uuid.substring(0, 8) : '';
}