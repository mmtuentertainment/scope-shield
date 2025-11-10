/**
 * Helper utility functions
 */

/**
 * Debounce function to limit execution frequency
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func.apply(this, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to limit execution to once per interval
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Sleep/delay function for testing
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after delay
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Extract text context around a match
 * @param {string} text - Full text
 * @param {number} matchIndex - Index of match
 * @param {number} matchLength - Length of match
 * @param {number} contextWords - Number of words before/after to include
 * @returns {string} Context string
 */
export function extractContext(text, matchIndex, matchLength, contextWords = 10) {
  if (!text || matchIndex < 0) return '';

  // Find start position by counting words backward from match
  let startIndex = matchIndex;
  let wordsBeforeMatch = 0;
  const wordBoundaryRegex = /\s+/;

  // Walk backward to find N words before match
  for (let i = matchIndex - 1; i >= 0 && wordsBeforeMatch < contextWords; i--) {
    if (wordBoundaryRegex.test(text[i]) && i > 0 && !wordBoundaryRegex.test(text[i - 1])) {
      wordsBeforeMatch++;
      if (wordsBeforeMatch === contextWords) {
        startIndex = i + 1;
        break;
      }
    }
    if (i === 0) startIndex = 0;
  }

  // Find end position by counting words forward from match end
  let endIndex = matchIndex + matchLength;
  let wordsAfterMatch = 0;

  // Walk forward to find N words after match
  for (let i = endIndex; i < text.length && wordsAfterMatch < contextWords; i++) {
    if (wordBoundaryRegex.test(text[i]) && i < text.length - 1 && !wordBoundaryRegex.test(text[i + 1])) {
      wordsAfterMatch++;
      if (wordsAfterMatch === contextWords) {
        endIndex = i;
        break;
      }
    }
    if (i === text.length - 1) endIndex = text.length;
  }

  return text.substring(startIndex, endIndex).trim();
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncate(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}