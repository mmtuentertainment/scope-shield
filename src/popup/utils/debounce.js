/**
 * Debounce utility
 *
 * Delays function execution until after wait milliseconds have elapsed
 * since the last time it was invoked.
 *
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
  if (typeof func !== 'function') {
    throw new TypeError('debounce: func must be a function');
  }
  if (typeof wait !== 'number' || wait < 0) {
    throw new TypeError('debounce: wait must be a non-negative number');
  }

  let timeoutId;

  return function debounced(...args) {
    clearTimeout(timeoutId);

    return new Promise((resolve, reject) => {
      timeoutId = setTimeout(async () => {
        try {
          const result = await func.apply(this, args);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, wait);
    });
  };
}
