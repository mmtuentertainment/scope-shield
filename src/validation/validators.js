/**
 * Pure validation functions for DetectionEvent fields
 *
 * All validators follow a consistent API:
 * - Accept the value to validate as the first parameter
 * - Return a ValidationResult object
 * - Are pure functions with no side effects
 * - Can be independently unit tested
 *
 * @module validators
 */

/**
 * Validation result type
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - Whether the validation passed
 * @property {string} [error] - Error message if validation failed
 */

/**
 * UUID v4 regex pattern
 * Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx where x is hex and y is 8,9,a,b
 * @type {RegExp}
 * @private
 */
const UUID_V4_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Email address regex pattern (basic RFC 5322 validation)
 * @type {RegExp}
 * @private
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Gmail thread ID pattern (16 hex characters)
 * Example: 18c5f0a1b2d3e4f5
 * @type {RegExp}
 * @private
 */
const THREAD_ID_PATTERN = /^[a-f0-9]{16}$/i;

/**
 * Gmail URL prefix for validation
 * @type {string}
 * @private
 */
const GMAIL_URL_PREFIX = 'https://mail.google.com/';

/**
 * Validate UUID v4 format
 * @param {string} id - The ID to validate
 * @returns {ValidationResult} Validation result with error message if invalid
 * @example
 * validateUuid('550e8400-e29b-41d4-a716-446655440000') // { valid: true }
 * validateUuid('invalid-uuid') // { valid: false, error: '...' }
 * validateUuid(null) // { valid: false, error: '...' }
 */
export function validateUuid(id) {
  if (!id || typeof id !== 'string') {
    return { valid: false, error: 'Invalid or missing id (must be UUID v4)' };
  }
  if (!UUID_V4_PATTERN.test(id)) {
    return { valid: false, error: 'Invalid or missing id (must be UUID v4)' };
  }
  return { valid: true };
}

/**
 * Validate email address format (basic RFC 5322 validation)
 * @param {string} email - The email to validate
 * @returns {ValidationResult} Validation result with error message if invalid
 * @example
 * validateEmail('user@example.com') // { valid: true }
 * validateEmail('invalid-email') // { valid: false, error: '...' }
 * validateEmail('') // { valid: false, error: '...' }
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Invalid or missing sender (must be valid email)' };
  }
  if (!EMAIL_PATTERN.test(email)) {
    return { valid: false, error: 'Invalid or missing sender (must be valid email)' };
  }
  return { valid: true };
}

/**
 * Validate Gmail URL format
 * @param {string} url - The URL to validate
 * @returns {ValidationResult} Validation result with error message if invalid
 */
export function validateGmailUrl(url) {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'Invalid or missing emailUrl (must be Gmail URL)' };
  }
  if (!url.startsWith(GMAIL_URL_PREFIX)) {
    return { valid: false, error: 'Invalid or missing emailUrl (must be Gmail URL)' };
  }
  return { valid: true };
}

/**
 * Validate trigger weight range (1-10)
 * Used for confidence scoring of scope creep detections
 * @param {number} weight - The weight to validate
 * @returns {ValidationResult} Validation result with error message if invalid
 * @example
 * validateWeight(7) // { valid: true }
 * validateWeight(0) // { valid: false, error: '...' }
 * validateWeight(11) // { valid: false, error: '...' }
 * validateWeight('7') // { valid: false, error: '...' }
 */
export function validateWeight(weight) {
  if (typeof weight !== 'number') {
    return { valid: false, error: 'Invalid triggerWeight (must be number between 1-10)' };
  }
  if (weight < 1 || weight > 10) {
    return { valid: false, error: 'Invalid triggerWeight (must be number between 1-10)' };
  }
  return { valid: true };
}

/**
 * Validate Gmail thread ID format (16 hex characters)
 * @param {string} threadId - The thread ID to validate
 * @returns {ValidationResult} Validation result with error message if invalid
 */
export function validateThreadId(threadId) {
  if (!threadId || typeof threadId !== 'string') {
    return { valid: false, error: 'Invalid or missing threadId (must be 16 hex characters)' };
  }
  if (!THREAD_ID_PATTERN.test(threadId)) {
    return { valid: false, error: 'Invalid or missing threadId (must be 16 hex characters)' };
  }
  return { valid: true };
}

/**
 * Validate non-empty string
 * @param {string} value - The value to validate
 * @param {string} fieldName - Name of the field for error message
 * @returns {ValidationResult} Validation result with error message if invalid
 */
export function validateNonEmptyString(value, fieldName) {
  if (!value || typeof value !== 'string') {
    return { valid: false, error: `Invalid or missing ${fieldName} (must be non-empty string)` };
  }
  return { valid: true };
}

/**
 * Validate string with max length
 * @param {string} value - The value to validate
 * @param {string} fieldName - Name of the field for error message
 * @param {number} maxLength - Maximum allowed length
 * @returns {ValidationResult} Validation result with error message if invalid
 * @example
 * validateStringLength('Hello', 'subject', 10) // { valid: true }
 * validateStringLength('Very long text', 'subject', 5) // { valid: false, error: '...' }
 * validateStringLength(null, 'subject', 10) // { valid: false, error: '...' }
 */
export function validateStringLength(value, fieldName, maxLength) {
  if (!value || typeof value !== 'string') {
    return { valid: false, error: `Invalid ${fieldName} (required)` };
  }
  if (value.length > maxLength) {
    return { valid: false, error: `Invalid ${fieldName} (max ${maxLength} chars)` };
  }
  return { valid: true };
}

/**
 * Validate ISO 8601 timestamp
 * @param {string} timestamp - The timestamp to validate
 * @returns {ValidationResult} Validation result with error message if invalid
 */
export function validateTimestamp(timestamp) {
  if (!timestamp || typeof timestamp !== 'string') {
    return { valid: false, error: 'Invalid or missing timestamp (must be ISO 8601)' };
  }
  if (isNaN(Date.parse(timestamp))) {
    return { valid: false, error: 'Invalid or missing timestamp (must be ISO 8601)' };
  }
  return { valid: true };
}

/**
 * Validate boolean value
 * @param {boolean} value - The value to validate
 * @param {string} fieldName - Name of the field for error message
 * @returns {ValidationResult} Validation result with error message if invalid
 */
export function validateBoolean(value, fieldName) {
  if (typeof value !== 'boolean') {
    return { valid: false, error: `Invalid ${fieldName} (must be boolean)` };
  }
  return { valid: true };
}

/**
 * Validate message ID (non-empty string)
 * @param {string} messageId - The message ID to validate
 * @returns {ValidationResult} Validation result with error message if invalid
 */
export function validateMessageId(messageId) {
  if (!messageId || typeof messageId !== 'string') {
    return { valid: false, error: 'Invalid or missing messageId (must be non-empty string)' };
  }
  return { valid: true };
}
