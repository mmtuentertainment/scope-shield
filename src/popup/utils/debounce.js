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
  let pendingReject;

  const debounced = function(...args) {
    clearTimeout(timeoutId);

    // Reject previous pending promise if any
    if (pendingReject) {
      pendingReject(new Error('Debounced call cancelled'));
    }

    return new Promise((resolve, reject) => {
      pendingReject = reject;

      timeoutId = setTimeout(async () => {
        try {
          const result = await func.apply(this, args);
          resolve(result);
          pendingReject = null;
        } catch (error) {
          reject(error);
          pendingReject = null;
        }
      }, wait);
    });
  };

  // Add cancel method to clear pending timeout and reject pending promise
  debounced.cancel = function() {
    clearTimeout(timeoutId);
    if (pendingReject) {
      pendingReject(new Error('Debounced call cancelled'));
      pendingReject = null;
    }
    timeoutId = null;
  };

  return debounced;
}
