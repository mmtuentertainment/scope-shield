// T021: Professional date formatting using Intl.DateTimeFormat

/**
 * Format date as professional long format (e.g., "November 12, 2025")
 * Uses browser-built-in Intl.DateTimeFormat (zero bundle cost)
 * @param {Date|string|number} date - Date to format
 * @param {string} locale - Locale string (default: 'en-US')
 * @returns {string} Formatted date string
 */
export function formatDateLong(date, locale = 'en-US') {
  const dateObj = date instanceof Date ? date : new Date(date);

  const formatter = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return formatter.format(dateObj);
}

/**
 * Format date as ISO 8601 string (e.g., "2025-11-12T10:30:00.000Z")
 * @param {Date|string|number} date - Date to format
 * @returns {string} ISO 8601 string
 */
export function formatDateISO(date) {
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toISOString();
}

/**
 * Format date as short format (e.g., "11/12/2025")
 * @param {Date|string|number} date - Date to format
 * @param {string} locale - Locale string (default: 'en-US')
 * @returns {string} Formatted date string
 */
export function formatDateShort(date, locale = 'en-US') {
  const dateObj = date instanceof Date ? date : new Date(date);

  const formatter = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  return formatter.format(dateObj);
}

/**
 * Format date for filename (e.g., "2025-11-12")
 * @param {Date|string|number} date - Date to format
 * @returns {string} Filename-safe date string
 */
export function formatDateForFilename(date) {
  const dateObj = date instanceof Date ? date : new Date(date);

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Get current date/time as ISO string
 * @returns {string} Current date/time in ISO format
 */
export function getCurrentDateTimeISO() {
  return new Date().toISOString();
}
