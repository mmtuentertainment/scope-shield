/**
 * AutoExportTimer - Manages countdown and auto-trigger for change order export
 *
 * Responsibilities:
 * - Start countdown timer after document rebuild completes
 * - Reset timer when user makes calculator changes (debounced)
 * - Emit countdown events for UI updates ("Auto-exporting in 3... 2... 1...")
 * - Call export callback when timer reaches 0
 * - Cancel pending export on user interaction or modal close
 * - Cleanup timers to prevent memory leaks
 *
 * Usage:
 * ```javascript
 * const timer = new AutoExportTimer({
 *   delay: 3, // seconds
 *   onExport: async () => ({ success: true }),
 *   onCountdown: (secondsLeft) => console.log(`${secondsLeft}s remaining`),
 *   onCancel: () => console.log('Cancelled')
 * });
 *
 * timer.start();
 * // ... user edits calculator ...
 * timer.reset(); // Restart countdown
 * // ... user clicks modal ...
 * timer.cancel(); // Stop countdown
 * timer.destroy(); // Cleanup on modal close
 * ```
 *
 * @module AutoExportTimer
 * @author Claude (Sonnet 4.5)
 * @since 2025-11-18
 */

export class AutoExportTimer {
  /**
   * Create auto-export timer
   * @param {Object} options - Timer configuration
   * @param {number} [options.delay=3] - Countdown delay in seconds (1-10)
   * @param {Function} options.onExport - Async callback when timer completes: () => Promise<{success, error?}>
   * @param {Function} [options.onCountdown] - Callback for countdown updates: (secondsLeft) => void
   * @param {Function} [options.onCancel] - Callback when timer cancelled: () => void
   * @throws {Error} If onExport not provided or invalid delay
   */
  constructor(options) {
    // Validate required options
    if (!options || typeof options.onExport !== 'function') {
      throw new Error('AutoExportTimer requires onExport callback');
    }

    // Validate delay range
    const delay = options.delay !== undefined ? options.delay : 3;
    if (typeof delay !== 'number' || delay < 1 || delay > 10) {
      throw new Error('AutoExportTimer delay must be between 1 and 10 seconds');
    }

    // Store configuration
    this.delay = delay;
    this.onExport = options.onExport;
    this.onCountdown = options.onCountdown || (() => {});
    this.onCancel = options.onCancel || (() => {});

    // Timer state
    this.timeoutId = null;
    this.countdownIntervalId = null;
    this.secondsRemaining = this.delay;
    this.isRunning = false;
    this.isDestroyed = false;
  }

  /**
   * Start countdown timer
   * - Emits countdown event immediately with initial seconds
   * - Updates countdown every second
   * - Calls onExport when countdown reaches 0
   *
   * @throws {Error} If timer already running or destroyed
   */
  start() {
    if (this.isDestroyed) {
      throw new Error('Cannot start destroyed timer');
    }

    if (this.isRunning) {
      throw new Error('Timer already running');
    }

    this.isRunning = true;
    this.secondsRemaining = this.delay;

    // Emit initial countdown
    this.onCountdown(this.secondsRemaining);

    // Start countdown interval (update every second)
    this.countdownIntervalId = setInterval(() => {
      this.secondsRemaining--;

      if (this.secondsRemaining > 0) {
        this.onCountdown(this.secondsRemaining);
      } else {
        // Countdown complete - trigger export
        this._triggerExport();
      }
    }, 1000);

    // Schedule export after delay
    this.timeoutId = setTimeout(() => {
      this._triggerExport();
    }, this.delay * 1000);
  }

  /**
   * Cancel pending auto-export
   * - Stops countdown and export timer
   * - Calls onCancel callback
   * - Safe to call multiple times (idempotent)
   */
  cancel() {
    if (!this.isRunning) {
      return; // Already cancelled or not started
    }

    this._clearTimers();
    this.isRunning = false;
    this.onCancel();
  }

  /**
   * Reset timer (restart countdown from beginning)
   * - Used when user makes calculator changes
   * - Cancels current timer and starts new one
   * - If timer not running, starts it
   */
  reset() {
    if (this.isDestroyed) {
      throw new Error('Cannot reset destroyed timer');
    }

    const wasRunning = this.isRunning;

    if (wasRunning) {
      this.cancel();
    }

    this.start();
  }

  /**
   * Check if timer is currently active
   * @returns {boolean} True if countdown in progress
   */
  isActive() {
    return this.isRunning;
  }

  /**
   * Destroy timer and cleanup resources
   * - Cancels any pending timers
   * - Prevents further use of timer instance
   * - Call this when modal closes to prevent memory leaks
   */
  destroy() {
    if (this.isDestroyed) {
      return; // Already destroyed
    }

    this.cancel();
    this.isDestroyed = true;

    // Clear all references to callbacks
    this.onExport = null;
    this.onCountdown = null;
    this.onCancel = null;
  }

  /**
   * Internal: Clear all active timers
   * @private
   */
  _clearTimers() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    if (this.countdownIntervalId) {
      clearInterval(this.countdownIntervalId);
      this.countdownIntervalId = null;
    }

    this.secondsRemaining = this.delay;
  }

  /**
   * Internal: Trigger export callback
   * - Called when countdown reaches 0
   * - Handles async export and errors
   * - Stops timers after export completes
   * @private
   */
  async _triggerExport() {
    if (!this.isRunning) {
      return; // Timer was cancelled
    }

    this._clearTimers();
    this.isRunning = false;

    try {
      await this.onExport();
    } catch (error) {
      // onExport callback handles its own errors
      // We just ensure timers are cleaned up
      console.error('AutoExportTimer: Export callback threw error:', error);
    }
  }
}
