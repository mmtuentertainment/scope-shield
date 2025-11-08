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

  // Find word boundaries before match
  let startIndex = matchIndex;
  let wordsFound = 0;
  for (let i = matchIndex - 1; i >= 0 && wordsFound < contextWords; i--) {
    if (text[i] === ' ') {
      wordsFound++;
      if (wordsFound === contextWords) {
        startIndex = i + 1;
        break;
      }
    }
    if (i === 0) startIndex = 0;
  }

  // Find word boundaries after match
  let endIndex = matchIndex + matchLength;
  wordsFound = 0;
  for (let i = endIndex; i < text.length && wordsFound < contextWords; i++) {
    if (text[i] === ' ') {
      wordsFound++;
      if (wordsFound === contextWords) {
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