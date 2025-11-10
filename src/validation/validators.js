/**
 * Pure validation functions for DetectionEvent fields
 * Each validator returns an object: { valid: boolean, error?: string }
 */

/**
 * UUID v4 regex pattern
 * @type {RegExp}
 */
const UUID_V4_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Email address regex pattern
 * @type {RegExp}
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Gmail thread ID pattern (16 hex characters)
 * @type {RegExp}
 */
const THREAD_ID_PATTERN = /^[a-f0-9]{16}$/i;

/**
 * Gmail URL prefix
 * @type {string}
 */
const GMAIL_URL_PREFIX = 'https://mail.google.com/';

/**
 * Validate UUID v4 format
 * @param {string} id - The ID to validate
 * @returns {{valid: boolean, error?: string}}
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
 * Validate email address format
 * @param {string} email - The email to validate
 * @returns {{valid: boolean, error?: string}}
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
 * @returns {{valid: boolean, error?: string}}
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
 * @param {number} weight - The weight to validate
 * @returns {{valid: boolean, error?: string}}
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
 * @returns {{valid: boolean, error?: string}}
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
 * @returns {{valid: boolean, error?: string}}
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
 * @returns {{valid: boolean, error?: string}}
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
 * @returns {{valid: boolean, error?: string}}
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
 * @returns {{valid: boolean, error?: string}}
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
 * @returns {{valid: boolean, error?: string}}
 */
export function validateMessageId(messageId) {
  if (!messageId || typeof messageId !== 'string') {
    return { valid: false, error: 'Invalid or missing messageId (must be non-empty string)' };
  }
  return { valid: true };
}
