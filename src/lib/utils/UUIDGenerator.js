// T020: UUID generation wrapper for crypto.randomUUID()

/**
 * Generate RFC 4122 compliant UUID v4
 * Uses browser-built-in crypto.randomUUID() (Chrome 92+)
 * @returns {string} UUID v4 string (e.g., "550e8400-e29b-41d4-a716-446655440000")
 */
export function generateUUID() {
  // Chrome 92+ supports crypto.randomUUID()
  if (crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback for older browsers (shouldn't happen with Manifest V3)
  // Simple UUID v4 implementation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Validate if string is valid UUID v4 format
 * @param {string} uuid - String to validate
 * @returns {boolean} True if valid UUID v4
 */
export function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return typeof uuid === 'string' && uuidRegex.test(uuid);
}
