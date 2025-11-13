// T034: Sanitizer utility tests

import { describe, it, expect } from 'vitest';
import { sanitizeText, sanitizeNumber, sanitizeEmail, sanitizeCurrency, truncateText } from '../../../src/lib/utils/Sanitizer.js';

describe('Sanitizer', () => {
  describe('sanitizeText', () => {
    it('should trim and limit text length', () => {
      const longText = 'a'.repeat(600);
      const result = sanitizeText(longText, 500);

      expect(result).toHaveLength(500);
    });

    it('should remove HTML-unsafe characters', () => {
      const unsafeText = 'Hello <script>alert("xss")</script> "world"';
      const result = sanitizeText(unsafeText);

      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
      expect(result).not.toContain('"');
      expect(result).not.toContain("'");
    });

    it('should limit consecutive newlines', () => {
      const text = 'Line 1\n\n\n\n\nLine 2';
      const result = sanitizeText(text);

      expect(result).toBe('Line 1\n\nLine 2');
    });

    it('should return empty string for non-string input', () => {
      expect(sanitizeText(null)).toBe('');
      expect(sanitizeText(undefined)).toBe('');
      expect(sanitizeText(123)).toBe('');
    });
  });

  describe('sanitizeNumber', () => {
    it('should return valid number within range', () => {
      expect(sanitizeNumber('150')).toBe(150);
      expect(sanitizeNumber(200)).toBe(200);
    });

    it('should clamp to minimum value', () => {
      expect(sanitizeNumber(-10, 0, 1000)).toBe(0);
    });

    it('should clamp to maximum value', () => {
      expect(sanitizeNumber(2000, 0, 1000)).toBe(1000);
    });

    it('should return 0 for invalid input', () => {
      expect(sanitizeNumber('not-a-number')).toBe(0);
      expect(sanitizeNumber(null)).toBe(0);
      expect(sanitizeNumber(undefined)).toBe(0);
    });
  });

  describe('sanitizeEmail', () => {
    it('should lowercase and trim email', () => {
      expect(sanitizeEmail('  Test@Example.COM  ')).toBe('test@example.com');
    });

    it('should return empty string for non-string input', () => {
      expect(sanitizeEmail(null)).toBe('');
      expect(sanitizeEmail(undefined)).toBe('');
    });
  });

  describe('sanitizeCurrency', () => {
    it('should format number as currency', () => {
      expect(sanitizeCurrency(1200)).toBe('$1,200');
      expect(sanitizeCurrency('1500')).toBe('$1,500');
    });

    it('should return $0 for invalid input', () => {
      expect(sanitizeCurrency('invalid')).toBe('$0');
      expect(sanitizeCurrency(null)).toBe('$0');
    });

    it('should format with commas for large numbers', () => {
      expect(sanitizeCurrency(123456)).toBe('$123,456');
    });
  });

  describe('truncateText', () => {
    it('should truncate long text with ellipsis', () => {
      const longText = 'a'.repeat(300);
      const result = truncateText(longText, 200);

      expect(result).toHaveLength(203); // 200 chars + "..."
      expect(result.endsWith('...')).toBe(true);
    });

    it('should not truncate short text', () => {
      const shortText = 'Short text';
      const result = truncateText(shortText, 200);

      expect(result).toBe(shortText);
      expect(result).not.toContain('...');
    });

    it('should return empty string for non-string input', () => {
      expect(truncateText(null)).toBe('');
      expect(truncateText(undefined)).toBe('');
    });
  });
});
