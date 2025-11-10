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
 * Find start index by walking backward N words
 * @param {string} text - Full text
 * @param {number} fromIndex - Starting position
 * @param {number} wordCount - Number of words to walk back
 * @returns {number} Start index
 */
function findStartIndex(text, fromIndex, wordCount) {
  const wordBoundaryRegex = /\s+/;
  let startIndex = fromIndex;
  let wordsFound = 0;

  for (let i = fromIndex - 1; i >= 0 && wordsFound < wordCount; i--) {
    const isWordBoundary = wordBoundaryRegex.test(text[i]);
    const prevIsNotBoundary = i > 0 && !wordBoundaryRegex.test(text[i - 1]);

    if (isWordBoundary && prevIsNotBoundary) {
      wordsFound++;
      if (wordsFound === wordCount) {
        return i + 1;
      }
    }
    if (i === 0) startIndex = 0;
  }

  return startIndex;
}

/**
 * Find end index by walking forward N words
 * @param {string} text - Full text
 * @param {number} fromIndex - Starting position
 * @param {number} wordCount - Number of words to walk forward
 * @returns {number} End index
 */
function findEndIndex(text, fromIndex, wordCount) {
  const wordBoundaryRegex = /\s+/;
  let endIndex = fromIndex;
  let wordsFound = 0;

  for (let i = fromIndex; i < text.length && wordsFound < wordCount; i++) {
    const isWordBoundary = wordBoundaryRegex.test(text[i]);
    const nextIsNotBoundary = i < text.length - 1 && !wordBoundaryRegex.test(text[i + 1]);

    if (isWordBoundary && nextIsNotBoundary) {
      wordsFound++;
      if (wordsFound === wordCount) {
        return i;
      }
    }
    if (i === text.length - 1) endIndex = text.length;
  }

  return endIndex;
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

  const startIndex = findStartIndex(text, matchIndex, contextWords);
  const endIndex = findEndIndex(text, matchIndex + matchLength, contextWords);

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
  return `${text.substring(0, maxLength - 3)  }...`;
}