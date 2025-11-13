// T022: Input sanitization utilities

/**
 * Sanitize text input (remove unsafe characters, limit length)
 * @param {string} input - Text to sanitize
 * @param {number} maxLength - Maximum length (default: 500)
 * @returns {string} Sanitized text
 */
export function sanitizeText(input, maxLength = 500) {
  if (typeof input !== 'string') return '';

  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>"']/g, '') // Remove HTML-unsafe characters (XSS prevention)
    .replace(/\n{3,}/g, '\n\n'); // Limit consecutive newlines
}

/**
 * Sanitize number input (ensure valid number within range)
 * @param {number|string} input - Number to sanitize
 * @param {number} min - Minimum value (default: 0)
 * @param {number} max - Maximum value (default: 999999)
 * @returns {number} Sanitized number
 */
export function sanitizeNumber(input, min = 0, max = 999999) {
  const num = parseFloat(input);
  if (isNaN(num)) return 0;
  return Math.max(min, Math.min(max, num));
}

/**
 * Sanitize email address
 * @param {string} email - Email to sanitize
 * @returns {string} Sanitized email (lowercase, trimmed)
 */
export function sanitizeEmail(email) {
  if (typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

/**
 * Sanitize currency string (format as $X,XXX.XX)
 * @param {string|number} amount - Amount to sanitize
 * @returns {string} Formatted currency string
 */
export function sanitizeCurrency(amount) {
  const num = parseFloat(amount);
  if (isNaN(num)) return '$0';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num);
}

/**
 * Truncate long text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Truncated text with "..." suffix
 */
export function truncateText(text, maxLength = 200) {
  if (typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;

  return text.slice(0, maxLength) + '...';
}
