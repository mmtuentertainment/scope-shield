// T022: Input sanitization utilities

/**
 * Normalize and sanitize a text input by trimming, truncating, removing angle brackets, and collapsing excessive newlines.
 *
 * If `input` is not a string, returns an empty string.
 * @param {string} input - Text to sanitize.
 * @param {number} [maxLength=500] - Maximum allowed length; result is truncated to this length.
 * @returns {string} Sanitized string with `<` and `>` removed and sequences of three or more newlines reduced to two.
 */
export function sanitizeText(input, maxLength = 500) {
  if (typeof input !== 'string') return '';

  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '') // Remove HTML tags (XSS prevention) - allow apostrophes and quotes
    .replace(/\n{3,}/g, '\n\n'); // Limit consecutive newlines
}

/**
 * Normalize a numeric input and clamp it to a specified range.
 *
 * Parses the input as a float, returns 0 if parsing fails, and clamps the result to the inclusive [min, max] range.
 * @param {number|string} input - Value to parse as a number.
 * @param {number} [min=0] - Minimum allowed value (inclusive).
 * @param {number} [max=999999] - Maximum allowed value (inclusive).
 * @returns {number} The parsed and clamped number; `0` if the input cannot be parsed as a number.
 */
export function sanitizeNumber(input, min = 0, max = 999999) {
  const num = parseFloat(input);
  if (isNaN(num)) return 0;
  return Math.max(min, Math.min(max, num));
}

/**
 * Normalize an email address by trimming surrounding whitespace and converting it to lowercase.
 * @param {string} email - Input email string.
 * @returns {string} The trimmed, lowercased email; returns an empty string if the input is not a string.
 */
export function sanitizeEmail(email) {
  if (typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

/**
 * Format an input amount as USD currency with no fractional digits.
 *
 * @param {string|number} amount - Amount to format; if not a valid number, the function returns "$0".
 * @returns {string} Formatted USD currency string with no fractional digits (e.g., "$1,000").
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
 * Truncates text and appends an ellipsis when it exceeds the maximum length.
 * @param {string} text - Input text to evaluate; non-strings produce an empty string.
 * @param {number} [maxLength=200] - Maximum allowed length before truncation.
 * @returns {string} The original text if its length is less than or equal to `maxLength`, otherwise the text truncated to `maxLength` characters followed by `...`.
 */
export function truncateText(text, maxLength = 200) {
  if (typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;

  return text.slice(0, maxLength) + '...';
}