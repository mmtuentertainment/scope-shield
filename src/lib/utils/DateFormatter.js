// T021: Professional date formatting using Intl.DateTimeFormat

/**
 * Format a date into a long, human-readable string like "November 12, 2025".
 * @param {Date|string|number} date - Date value to format; accepts a Date, timestamp, or date string.
 * @param {string} [locale='en-US'] - BCP 47 language tag used for localization.
 * @returns {string} The formatted date string using the locale's long month, numeric day, and numeric year.
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
 * Formats a date as an ISO 8601 string (e.g., "2025-11-12T10:30:00.000Z").
 * @param {Date|string|number} date - Date object, timestamp, or date string to convert.
 * @returns {string} ISO 8601 representation of the provided date.
 */
export function formatDateISO(date) {
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toISOString();
}

/**
 * Formats a date into a short, locale-aware numeric string (e.g., "11/12/2025").
 * @param {Date|string|number} date - Date to format; accepts a Date object, ISO/string, or timestamp.
 * @param {string} [locale='en-US'] - BCP 47 locale string used for formatting.
 * @returns {string} The date formatted as a short, locale-aware numeric string (MM/DD/YYYY or locale equivalent).
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
 * Get the current date and time in ISO 8601 format.
 * @returns {string} The current date and time as an ISO 8601 string.
 */
export function getCurrentDateTimeISO() {
  return new Date().toISOString();
}