/**
 * Tests for AutoExportTimer
 *
 * Coverage:
 * - T196: start() triggers callback after delay
 * - T197: cancel() stops countdown
 * - T198: reset() restarts timer
 * - T199: Countdown callbacks emit every second
 * - Additional: Error handling, edge cases, cleanup
 *
 * @module AutoExportTimer.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AutoExportTimer } from '../../../src/lib/change-order/AutoExportTimer.js';

describe('AutoExportTimer', () => {
  let mockOnExport;
  let mockOnCountdown;
  let mockOnCancel;

  beforeEach(() => {
    // Reset all mocks before each test
    mockOnExport = vi.fn().mockResolvedValue({ success: true });
    mockOnCountdown = vi.fn();
    mockOnCancel = vi.fn();

    // Use fake timers for deterministic testing
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Restore real timers after each test
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Constructor', () => {
    it('should create timer with valid options', () => {
      const timer = new AutoExportTimer({
        delay: 3,
        onExport: mockOnExport,
        onCountdown: mockOnCountdown,
        onCancel: mockOnCancel
      });

      expect(timer.delay).toBe(3);
      expect(timer.isActive()).toBe(false);
      expect(timer.isDestroyed).toBe(false);
    });

    it('should use default delay of 3 seconds if not specified', () => {
      const timer = new AutoExportTimer({
        onExport: mockOnExport
      });

      expect(timer.delay).toBe(3);
    });

    it('should throw error if onExport not provided', () => {
      expect(() => {
        new AutoExportTimer({ delay: 3 });
      }).toThrow('AutoExportTimer requires onExport callback');
    });

    it('should throw error if onExport is not a function', () => {
      expect(() => {
        new AutoExportTimer({ onExport: 'not-a-function' });
      }).toThrow('AutoExportTimer requires onExport callback');
    });

    it('should throw error if delay less than 1 second', () => {
      expect(() => {
        new AutoExportTimer({ delay: 0, onExport: mockOnExport });
      }).toThrow('delay must be between 1 and 10 seconds');
    });

    it('should throw error if delay greater than 10 seconds', () => {
      expect(() => {
        new AutoExportTimer({ delay: 11, onExport: mockOnExport });
      }).toThrow('delay must be between 1 and 10 seconds');
    });

    it('should allow delay boundary values (1 and 10)', () => {
      const timer1 = new AutoExportTimer({ delay: 1, onExport: mockOnExport });
      const timer10 = new AutoExportTimer({ delay: 10, onExport: mockOnExport });

      expect(timer1.delay).toBe(1);
      expect(timer10.delay).toBe(10);
    });
  });

  describe('start()', () => {
    it('should start countdown and emit initial seconds (T196)', () => {
      const timer = new AutoExportTimer({
        delay: 3,
        onExport: mockOnExport,
        onCountdown: mockOnCountdown
      });

      timer.start();

      expect(timer.isActive()).toBe(true);
      expect(mockOnCountdown).toHaveBeenCalledWith(3);
    });

    it('should trigger onExport after delay completes (T196)', async () => {
      const timer = new AutoExportTimer({
        delay: 3,
        onExport: mockOnExport
      });

      timer.start();

      // Fast-forward time by 3 seconds
      await vi.advanceTimersByTimeAsync(3000);

      expect(mockOnExport).toHaveBeenCalledTimes(1);
      expect(timer.isActive()).toBe(false);
    });

    it('should emit countdown every second (T199)', async () => {
      const timer = new AutoExportTimer({
        delay: 3,
        onExport: mockOnExport,
        onCountdown: mockOnCountdown
      });

      timer.start();

      // Initial call with 3
      expect(mockOnCountdown).toHaveBeenCalledWith(3);

      // Advance 1 second
      await vi.advanceTimersByTimeAsync(1000);
      expect(mockOnCountdown).toHaveBeenCalledWith(2);

      // Advance another second
      await vi.advanceTimersByTimeAsync(1000);
      expect(mockOnCountdown).toHaveBeenCalledWith(1);

      // Final second - no countdown call (export triggers)
      await vi.advanceTimersByTimeAsync(1000);

      // Should have been called 3 times total (3, 2, 1)
      expect(mockOnCountdown).toHaveBeenCalledTimes(3);
    });

    it('should throw error if timer already running', () => {
      const timer = new AutoExportTimer({
        delay: 3,
        onExport: mockOnExport
      });

      timer.start();

      expect(() => {
        timer.start();
      }).toThrow('Timer already running');
    });

    it('should throw error if timer destroyed', () => {
      const timer = new AutoExportTimer({
        delay: 3,
        onExport: mockOnExport
      });

      timer.destroy();

      expect(() => {
        timer.start();
      }).toThrow('Cannot start destroyed timer');
    });

    it('should work with 1-second delay', async () => {
      const timer = new AutoExportTimer({
        delay: 1,
        onExport: mockOnExport,
        onCountdown: mockOnCountdown
      });

      timer.start();

      expect(mockOnCountdown).toHaveBeenCalledWith(1);

      await vi.advanceTimersByTimeAsync(1000);

      expect(mockOnExport).toHaveBeenCalledTimes(1);
      expect(mockOnCountdown).toHaveBeenCalledTimes(1); // Only initial call
    });

    it('should work with 10-second delay', async () => {
      const timer = new AutoExportTimer({
        delay: 10,
        onExport: mockOnExport,
        onCountdown: mockOnCountdown
      });

      timer.start();

      expect(mockOnCountdown).toHaveBeenCalledWith(10);

      // Fast-forward through all 10 seconds
      await vi.advanceTimersByTimeAsync(10000);

      expect(mockOnExport).toHaveBeenCalledTimes(1);
      // Should have 10 countdown calls (10, 9, 8, ..., 1)
      expect(mockOnCountdown).toHaveBeenCalledTimes(10);
    });
  });

  describe('cancel()', () => {
    it('should stop countdown before completion (T197)', async () => {
      const timer = new AutoExportTimer({
        delay: 3,
        onExport: mockOnExport,
        onCancel: mockOnCancel
      });

      timer.start();

      // Advance 1 second
      await vi.advanceTimersByTimeAsync(1000);

      timer.cancel();

      expect(timer.isActive()).toBe(false);
      expect(mockOnCancel).toHaveBeenCalledTimes(1);

      // Advance remaining time
      await vi.advanceTimersByTimeAsync(2000);

      // onExport should NOT be called
      expect(mockOnExport).not.toHaveBeenCalled();
    });

    it('should be safe to call multiple times (idempotent)', () => {
      const timer = new AutoExportTimer({
        delay: 3,
        onExport: mockOnExport,
        onCancel: mockOnCancel
      });

      timer.start();
      timer.cancel();
      timer.cancel(); // Second call

      expect(mockOnCancel).toHaveBeenCalledTimes(1); // Only once
    });

    it('should be safe to call when timer not started', () => {
      const timer = new AutoExportTimer({
        delay: 3,
        onExport: mockOnExport,
        onCancel: mockOnCancel
      });

      timer.cancel(); // Call without start

      expect(mockOnCancel).not.toHaveBeenCalled();
      expect(timer.isActive()).toBe(false);
    });

    it('should clear both timeout and interval timers', async () => {
      const timer = new AutoExportTimer({
        delay: 3,
        onExport: mockOnExport,
        onCountdown: mockOnCountdown
      });

      timer.start();

      // Verify countdown is happening
      await vi.advanceTimersByTimeAsync(1000);
      expect(mockOnCountdown).toHaveBeenCalledWith(2);

      timer.cancel();

      // Advance more time
      await vi.advanceTimersByTimeAsync(5000);

      // No more countdown calls
      expect(mockOnCountdown).toHaveBeenCalledTimes(2); // Initial + 1 second only
      expect(mockOnExport).not.toHaveBeenCalled();
    });
  });

  describe('reset()', () => {
    it('should restart countdown from beginning (T198)', async () => {
      const timer = new AutoExportTimer({
        delay: 3,
        onExport: mockOnExport,
        onCountdown: mockOnCountdown
      });

      timer.start();

      // Advance 2 seconds (1 second remaining)
      await vi.advanceTimersByTimeAsync(2000);
      expect(mockOnCountdown).toHaveBeenCalledWith(1);

      // Reset timer
      mockOnCountdown.mockClear();
      timer.reset();

      // Should restart from 3 seconds
      expect(mockOnCountdown).toHaveBeenCalledWith(3);
      expect(timer.isActive()).toBe(true);

      // Complete the new countdown
      await vi.advanceTimersByTimeAsync(3000);
      expect(mockOnExport).toHaveBeenCalledTimes(1);
    });

    it('should start timer if not running', async () => {
      const timer = new AutoExportTimer({
        delay: 3,
        onExport: mockOnExport,
        onCountdown: mockOnCountdown
      });

      timer.reset(); // Reset without start

      expect(timer.isActive()).toBe(true);
      expect(mockOnCountdown).toHaveBeenCalledWith(3);

      await vi.advanceTimersByTimeAsync(3000);
      expect(mockOnExport).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel for previous timer', async () => {
      const timer = new AutoExportTimer({
        delay: 3,
        onExport: mockOnExport,
        onCancel: mockOnCancel
      });

      timer.start();

      await vi.advanceTimersByTimeAsync(1000);

      timer.reset();

      // onCancel should be called when resetting
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('should throw error if timer destroyed', () => {
      const timer = new AutoExportTimer({
        delay: 3,
        onExport: mockOnExport
      });

      timer.destroy();

      expect(() => {
        timer.reset();
      }).toThrow('Cannot reset destroyed timer');
    });

    it('should handle rapid resets (debouncing scenario)', async () => {
      const timer = new AutoExportTimer({
        delay: 3,
        onExport: mockOnExport,
        onCountdown: mockOnCountdown
      });

      timer.start();

      // Simulate user editing calculator rapidly
      await vi.advanceTimersByTimeAsync(500);
      timer.reset();

      await vi.advanceTimersByTimeAsync(500);
      timer.reset();

      await vi.advanceTimersByTimeAsync(500);
      timer.reset();

      // Now let it complete
      await vi.advanceTimersByTimeAsync(3000);

      // Only ONE export should happen
      expect(mockOnExport).toHaveBeenCalledTimes(1);
    });
  });

  describe('isActive()', () => {
    it('should return false initially', () => {
      const timer = new AutoExportTimer({
        delay: 3,
        onExport: mockOnExport
      });

      expect(timer.isActive()).toBe(false);
    });

    it('should return true while running', () => {
      const timer = new AutoExportTimer({
        delay: 3,
        onExport: mockOnExport
      });

      timer.start();

      expect(timer.isActive()).toBe(true);
    });

    it('should return false after cancelled', () => {
      const timer = new AutoExportTimer({
        delay: 3,
        onExport: mockOnExport
      });

      timer.start();
      timer.cancel();

      expect(timer.isActive()).toBe(false);
    });

    it('should return false after export completes', async () => {
      const timer = new AutoExportTimer({
        delay: 3,
        onExport: mockOnExport
      });

      timer.start();

      await vi.advanceTimersByTimeAsync(3000);

      expect(timer.isActive()).toBe(false);
    });
  });

  describe('destroy()', () => {
    it('should cleanup timers and prevent further use', async () => {
      const timer = new AutoExportTimer({
        delay: 3,
        onExport: mockOnExport,
        onCountdown: mockOnCountdown
      });

      timer.start();

      await vi.advanceTimersByTimeAsync(1000);

      timer.destroy();

      expect(timer.isDestroyed).toBe(true);
      expect(timer.isActive()).toBe(false);

      // Advancing time should not trigger anything
      await vi.advanceTimersByTimeAsync(5000);
      expect(mockOnExport).not.toHaveBeenCalled();
    });

    it('should be safe to call multiple times (idempotent)', () => {
      const timer = new AutoExportTimer({
        delay: 3,
        onExport: mockOnExport
      });

      timer.start();
      timer.destroy();
      timer.destroy(); // Second call

      expect(timer.isDestroyed).toBe(true);
    });

    it('should clear all callback references', () => {
      const timer = new AutoExportTimer({
        delay: 3,
        onExport: mockOnExport,
        onCountdown: mockOnCountdown,
        onCancel: mockOnCancel
      });

      timer.destroy();

      expect(timer.onExport).toBeNull();
      expect(timer.onCountdown).toBeNull();
      expect(timer.onCancel).toBeNull();
    });

    it('should prevent memory leaks', async () => {
      const timer = new AutoExportTimer({
        delay: 3,
        onExport: mockOnExport,
        onCountdown: mockOnCountdown
      });

      timer.start();
      timer.destroy();

      // Advance time - no calls should happen
      await vi.advanceTimersByTimeAsync(10000);

      // Only the initial countdown call before destroy
      expect(mockOnCountdown).toHaveBeenCalledTimes(1);
      expect(mockOnExport).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle onExport callback errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const errorCallback = vi.fn().mockRejectedValue(new Error('Export failed'));

      const timer = new AutoExportTimer({
        delay: 1,
        onExport: errorCallback
      });

      timer.start();

      await vi.advanceTimersByTimeAsync(1000);

      // Timer should still complete despite error
      expect(timer.isActive()).toBe(false);
      expect(errorCallback).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should not trigger export if timer cancelled before completion', async () => {
      const timer = new AutoExportTimer({
        delay: 3,
        onExport: mockOnExport
      });

      timer.start();

      // Cancel right before completion
      await vi.advanceTimersByTimeAsync(2999);
      timer.cancel();

      await vi.advanceTimersByTimeAsync(1000);

      expect(mockOnExport).not.toHaveBeenCalled();
    });
  });

  describe('Integration Scenarios', () => {
    it('should simulate calculator edit debouncing (reset on each edit)', async () => {
      const timer = new AutoExportTimer({
        delay: 3,
        onExport: mockOnExport,
        onCountdown: mockOnCountdown
      });

      // User starts editing
      timer.start();

      // User edits after 1 second
      await vi.advanceTimersByTimeAsync(1000);
      timer.reset();

      // User edits again after 1 second
      await vi.advanceTimersByTimeAsync(1000);
      timer.reset();

      // User stops editing, timer completes
      await vi.advanceTimersByTimeAsync(3000);

      // Export should only trigger once
      expect(mockOnExport).toHaveBeenCalledTimes(1);
    });

    it('should simulate modal close during countdown', async () => {
      const timer = new AutoExportTimer({
        delay: 3,
        onExport: mockOnExport,
        onCountdown: mockOnCountdown
      });

      timer.start();

      // User closes modal after 2 seconds
      await vi.advanceTimersByTimeAsync(2000);
      timer.destroy();

      // Advance remaining time
      await vi.advanceTimersByTimeAsync(5000);

      // Export should NOT trigger
      expect(mockOnExport).not.toHaveBeenCalled();
    });

    it('should simulate click-to-cancel workflow', async () => {
      const timer = new AutoExportTimer({
        delay: 3,
        onExport: mockOnExport,
        onCancel: mockOnCancel
      });

      timer.start();

      // User sees "Auto-exporting in 2..." and clicks
      await vi.advanceTimersByTimeAsync(1000);
      timer.cancel();

      // Cancel callback should fire
      expect(mockOnCancel).toHaveBeenCalledTimes(1);

      // Export should not trigger
      await vi.advanceTimersByTimeAsync(5000);
      expect(mockOnExport).not.toHaveBeenCalled();
    });
  });
});
