// FilenameUtils Tests

import { describe, it, expect } from 'vitest';
import {
  sanitizeClientName,
  formatFilenameDate,
  generateChangeOrderFilename
} from '../../../../src/lib/change-order/export/FilenameUtils.js';

describe('FilenameUtils', () => {
  describe('sanitizeClientName', () => {
    it('should sanitize special characters', () => {
      const result = sanitizeClientName('A/B\\C:D*E?F"G<H>I|J');
      expect(result).toBe('A_B_C_D_E_F_G_H_I_J');
    });

    it('should collapse multiple underscores', () => {
      const result = sanitizeClientName('A   B   C');
      expect(result).toBe('A_B_C');
    });

    it('should trim leading/trailing underscores', () => {
      const result = sanitizeClientName('___Test___');
      expect(result).toBe('Test');
    });

    it('should handle default value', () => {
      const result = sanitizeClientName();
      expect(result).toBe('Client');
    });

    it('should truncate to maxLength', () => {
      const result = sanitizeClientName('A'.repeat(100), 20);
      expect(result.length).toBeLessThanOrEqual(20);
    });

    it('should preserve valid characters', () => {
      const result = sanitizeClientName('Acme_Corp-123');
      expect(result).toBe('Acme_Corp-123');
    });

    it('should handle null input', () => {
      const result = sanitizeClientName(null);
      expect(result).toBe('Client');
    });

    it('should handle undefined input explicitly', () => {
      const result = sanitizeClientName(undefined);
      expect(result).toBe('Client');
    });

    it('should handle non-string input', () => {
      const result = sanitizeClientName(12345);
      expect(result).toBe('Client');
    });

    it('should handle input that sanitizes to empty string', () => {
      const result = sanitizeClientName('!!!@@@###');
      expect(result).toBe('Client');
    });
  });

  describe('formatFilenameDate', () => {
    it('should return provided date', () => {
      const result = formatFilenameDate('2025-11-15');
      expect(result).toBe('2025-11-15');
    });

    it('should return current date if not provided', () => {
      const result = formatFilenameDate();
      const today = new Date().toISOString().split('T')[0];
      expect(result).toBe(today);
    });

    it('should handle undefined', () => {
      const result = formatFilenameDate(undefined);
      const today = new Date().toISOString().split('T')[0];
      expect(result).toBe(today);
    });
  });

  describe('generateChangeOrderFilename', () => {
    it('should generate filename with txt extension', () => {
      const filename = generateChangeOrderFilename({
        clientName: 'Acme Corp',
        date: '2025-11-15'
      }, 'txt');

      expect(filename).toBe('ChangeOrder_Acme_Corp_2025-11-15.txt');
    });

    it('should generate filename with pdf extension', () => {
      const filename = generateChangeOrderFilename({
        clientName: 'Acme Corp',
        date: '2025-11-15'
      }, 'pdf');

      expect(filename).toBe('ChangeOrder_Acme_Corp_2025-11-15.pdf');
    });

    it('should sanitize client name', () => {
      const filename = generateChangeOrderFilename({
        clientName: 'Client Inc. / "Dangerous" <Name>',
        date: '2025-11-15'
      }, 'txt');

      expect(filename).toBe('ChangeOrder_Client_Inc_Dangerous_Name_2025-11-15.txt');
    });

    it('should use defaults when metadata empty', () => {
      const filename = generateChangeOrderFilename({}, 'txt');
      const today = new Date().toISOString().split('T')[0];

      expect(filename).toContain('Client');
      expect(filename).toContain(today);
      expect(filename).toContain('.txt');
    });

    it('should use default client name if not provided', () => {
      const filename = generateChangeOrderFilename({
        date: '2025-11-15'
      }, 'txt');

      expect(filename).toBe('ChangeOrder_Client_2025-11-15.txt');
    });

    it('should use current date if not provided', () => {
      const filename = generateChangeOrderFilename({
        clientName: 'Test'
      }, 'txt');
      const today = new Date().toISOString().split('T')[0];

      expect(filename).toContain(today);
    });

    it('should handle null metadata', () => {
      const filename = generateChangeOrderFilename(null, 'txt');
      const today = new Date().toISOString().split('T')[0];

      expect(filename).toContain('Client');
      expect(filename).toContain(today);
      expect(filename).toContain('.txt');
    });

    it('should sanitize extension to prevent path traversal', () => {
      const filename = generateChangeOrderFilename({
        clientName: 'Test',
        date: '2025-11-15'
      }, '../malicious');

      // Extension should be sanitized
      expect(filename).toBe('ChangeOrder_Test_2025-11-15.malicious');
      expect(filename).not.toContain('../');
    });

    it('should handle special characters in extension', () => {
      const filename = generateChangeOrderFilename({
        clientName: 'Test',
        date: '2025-11-15'
      }, 'p@d#f!');

      expect(filename).toBe('ChangeOrder_Test_2025-11-15.pdf');
    });
  });
});
