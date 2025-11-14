import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { formatRelativeTime } from '../../../src/popup/utils/FormatHelpers.js';

describe('FormatHelpers', () => {
  beforeEach(() => {
    // Use fake timers to control time
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-11-14T12:00:00.000Z'));
  });

  afterEach(() => {
    // Restore real timers
    vi.useRealTimers();
  });

  describe('formatRelativeTime', () => {
    it('should return "Just now" for current time', () => {
      const now = Date.now();
      expect(formatRelativeTime(now)).toBe('Just now');
    });

    it('should return "Xm ago" for minutes', () => {
      const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
      expect(formatRelativeTime(fiveMinutesAgo)).toBe('5m ago');

      const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000);
      expect(formatRelativeTime(thirtyMinutesAgo)).toBe('30m ago');
    });

    it('should return "Xh ago" for hours', () => {
      const twoHoursAgo = Date.now() - (2 * 60 * 60 * 1000);
      expect(formatRelativeTime(twoHoursAgo)).toBe('2h ago');

      const tenHoursAgo = Date.now() - (10 * 60 * 60 * 1000);
      expect(formatRelativeTime(tenHoursAgo)).toBe('10h ago');
    });

    it('should return "Xd ago" for days', () => {
      const twoDaysAgo = Date.now() - (2 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(twoDaysAgo)).toBe('2d ago');

      const fiveDaysAgo = Date.now() - (5 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(fiveDaysAgo)).toBe('5d ago');
    });

    it('should return formatted date for >7 days', () => {
      const eightDaysAgo = Date.now() - (8 * 24 * 60 * 60 * 1000);
      const result = formatRelativeTime(eightDaysAgo);
      expect(result).toMatch(/^[A-Z][a-z]{2} \d{1,2}$/); // e.g., "Nov 6"
    });

    it('should handle boundary at 1 hour', () => {
      const justUnderOneHour = Date.now() - (59 * 60 * 1000);
      expect(formatRelativeTime(justUnderOneHour)).toBe('59m ago');

      const exactlyOneHour = Date.now() - (60 * 60 * 1000);
      expect(formatRelativeTime(exactlyOneHour)).toBe('1h ago');
    });

    it('should handle boundary at 24 hours', () => {
      const justUnder24Hours = Date.now() - (23 * 60 * 60 * 1000);
      expect(formatRelativeTime(justUnder24Hours)).toBe('23h ago');

      const exactly24Hours = Date.now() - (24 * 60 * 60 * 1000);
      expect(formatRelativeTime(exactly24Hours)).toBe('1d ago');
    });

    it('should handle boundary at 7 days', () => {
      const justUnder7Days = Date.now() - (6 * 24 * 60 * 60 * 1000 + 23 * 60 * 60 * 1000);
      expect(formatRelativeTime(justUnder7Days)).toBe('6d ago');

      const exactly7Days = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const result = formatRelativeTime(exactly7Days);
      expect(result).toMatch(/^[A-Z][a-z]{2} \d{1,2}$/);
    });

    it('should handle future timestamps gracefully', () => {
      const future = Date.now() + (5 * 60 * 1000);
      // Should handle negative diff gracefully (implementation dependent)
      expect(() => formatRelativeTime(future)).not.toThrow();
    });
  });
});
