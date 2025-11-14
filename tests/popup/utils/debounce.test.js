import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { debounce } from '../../../src/popup/utils/debounce.js';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Input Validation', () => {
    it('should throw TypeError if func is not a function', () => {
      expect(() => debounce('not a function', 100)).toThrow(TypeError);
      expect(() => debounce('not a function', 100)).toThrow('func must be a function');
    });

    it('should throw TypeError if wait is not a number', () => {
      expect(() => debounce(() => {}, 'invalid')).toThrow(TypeError);
      expect(() => debounce(() => {}, 'invalid')).toThrow('wait must be a non-negative number');
    });

    it('should throw TypeError if wait is negative', () => {
      expect(() => debounce(() => {}, -100)).toThrow(TypeError);
      expect(() => debounce(() => {}, -100)).toThrow('wait must be a non-negative number');
    });

    it('should accept wait of 0', () => {
      expect(() => debounce(() => {}, 0)).not.toThrow();
    });
  });

  it('should delay function execution', async () => {
    const func = vi.fn().mockResolvedValue('result');
    const debounced = debounce(func, 100);

    const promise = debounced('arg1', 'arg2');

    // Should not be called immediately
    expect(func).not.toHaveBeenCalled();

    // Fast-forward time
    vi.advanceTimersByTime(100);

    // Wait for promise
    const result = await promise;

    expect(func).toHaveBeenCalledWith('arg1', 'arg2');
    expect(result).toBe('result');
  });

  it('should cancel previous calls', async () => {
    const func = vi.fn().mockResolvedValue('result');
    const debounced = debounce(func, 100);

    // Call multiple times
    debounced('call1');
    debounced('call2');
    const promise = debounced('call3');

    // Fast-forward
    vi.advanceTimersByTime(100);
    await promise;

    // Only last call should execute
    expect(func).toHaveBeenCalledTimes(1);
    expect(func).toHaveBeenCalledWith('call3');
  });

  it('should handle errors', async () => {
    const error = new Error('Test error');
    const func = vi.fn().mockRejectedValue(error);
    const debounced = debounce(func, 100);

    const promise = debounced();

    vi.advanceTimersByTime(100);

    await expect(promise).rejects.toThrow('Test error');
  });

  it('should preserve context', async () => {
    const context = { value: 42 };
    const func = vi.fn(function() {
      return this.value;
    });
    const debounced = debounce(func, 100);

    const promise = debounced.call(context);

    vi.advanceTimersByTime(100);
    const result = await promise;

    expect(result).toBe(42);
  });
});
