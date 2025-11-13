/**
 * ChangeOrderNumbering Tests
 *
 * Tests for sequential change order number generation with zero-padding.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ChangeOrderNumberingService, NUMBER_PADDING } from '../../../src/lib/change-order/ChangeOrderNumbering.js';
import changeOrderHistory from '../../../src/lib/change-order/ChangeOrderHistory.js';

describe('ChangeOrderNumbering', () => {
  let numberingService;

  beforeEach(() => {
    numberingService = new ChangeOrderNumberingService();

    // Mock changeOrderHistory.getAllForClient
    vi.spyOn(changeOrderHistory, 'getAllForClient').mockResolvedValue([]);
  });

  describe('getNextNumberForClient()', () => {
    it('should return #001 for first-time client', async () => {
      // Mock empty history
      changeOrderHistory.getAllForClient.mockResolvedValue([]);

      const result = await numberingService.getNextNumberForClient('newclient@test.com');

      expect(result).toBe('#001');
    });

    it('should increment from existing numbers', async () => {
      // Mock history with existing orders
      changeOrderHistory.getAllForClient.mockResolvedValue([
        { changeOrderNumber: '#001' },
        { changeOrderNumber: '#002' },
        { changeOrderNumber: '#003' }
      ]);

      const result = await numberingService.getNextNumberForClient('client@test.com');

      expect(result).toBe('#004');
    });

    it('should handle non-sequential existing numbers', async () => {
      // Mock history with gaps (e.g., some deleted)
      changeOrderHistory.getAllForClient.mockResolvedValue([
        { changeOrderNumber: '#001' },
        { changeOrderNumber: '#005' }, // Gap
        { changeOrderNumber: '#003' }
      ]);

      const result = await numberingService.getNextNumberForClient('client@test.com');

      // Should use highest + 1
      expect(result).toBe('#006');
    });

    it('should maintain zero-padding for numbers < 100', async () => {
      changeOrderHistory.getAllForClient.mockResolvedValue([
        { changeOrderNumber: '#042' }
      ]);

      const result = await numberingService.getNextNumberForClient('client@test.com');

      expect(result).toBe('#043');
      expect(result).toHaveLength(4); // # + 3 digits
    });

    it('should handle numbers >= 100', async () => {
      changeOrderHistory.getAllForClient.mockResolvedValue([
        { changeOrderNumber: '#099' }
      ]);

      const result = await numberingService.getNextNumberForClient('client@test.com');

      expect(result).toBe('#100');
    });

    it('should handle invalid email gracefully', async () => {
      const result1 = await numberingService.getNextNumberForClient(null);
      const result2 = await numberingService.getNextNumberForClient('');
      const result3 = await numberingService.getNextNumberForClient(123);

      expect(result1).toBe('#001');
      expect(result2).toBe('#001');
      expect(result3).toBe('#001');
    });

    it('should fallback to #001 if all existing numbers are invalid', async () => {
      changeOrderHistory.getAllForClient.mockResolvedValue([
        { changeOrderNumber: 'invalid' },
        { changeOrderNumber: 'ABC' },
        { changeOrderNumber: '#XYZ' }
      ]);

      const result = await numberingService.getNextNumberForClient('client@test.com');

      expect(result).toBe('#001');
    });

    it('should handle history lookup errors', async () => {
      changeOrderHistory.getAllForClient.mockRejectedValue(new Error('Storage error'));

      const result = await numberingService.getNextNumberForClient('client@test.com');

      expect(result).toBe('#001'); // Fallback
    });
  });

  describe('_formatNumber()', () => {
    it('should format single digit with zero-padding', () => {
      expect(numberingService._formatNumber(1)).toBe('#001');
      expect(numberingService._formatNumber(5)).toBe('#005');
      expect(numberingService._formatNumber(9)).toBe('#009');
    });

    it('should format double digits with zero-padding', () => {
      expect(numberingService._formatNumber(10)).toBe('#010');
      expect(numberingService._formatNumber(42)).toBe('#042');
      expect(numberingService._formatNumber(99)).toBe('#099');
    });

    it('should format triple digits without padding', () => {
      expect(numberingService._formatNumber(100)).toBe('#100');
      expect(numberingService._formatNumber(500)).toBe('#500');
      expect(numberingService._formatNumber(999)).toBe('#999');
    });

    it('should handle numbers beyond padding length', () => {
      expect(numberingService._formatNumber(1000)).toBe('#1000');
      expect(numberingService._formatNumber(12345)).toBe('#12345');
    });

    it('should handle invalid numbers', () => {
      expect(numberingService._formatNumber(0)).toBe('#001');
      expect(numberingService._formatNumber(-5)).toBe('#001');
      expect(numberingService._formatNumber(1.5)).toBe('#001');
      expect(numberingService._formatNumber(NaN)).toBe('#001');
      expect(numberingService._formatNumber(null)).toBe('#001');
    });
  });

  describe('_extractNumber()', () => {
    it('should extract number from properly formatted string', () => {
      expect(numberingService._extractNumber('#001')).toBe(1);
      expect(numberingService._extractNumber('#042')).toBe(42);
      expect(numberingService._extractNumber('#100')).toBe(100);
      expect(numberingService._extractNumber('#999')).toBe(999);
    });

    it('should handle whitespace around number', () => {
      expect(numberingService._extractNumber('#  001')).toBe(1);
      expect(numberingService._extractNumber('#042  ')).toBe(42);
    });

    it('should return null for invalid formats', () => {
      // Note: _extractNumber is lenient and accepts '001' without # (returns 1)
      // This is intentional for error recovery with historical data
      expect(numberingService._extractNumber('#ABC')).toBeNull(); // Not a number
      expect(numberingService._extractNumber('#')).toBeNull(); // No number
      expect(numberingService._extractNumber('invalid')).toBeNull();
      expect(numberingService._extractNumber('')).toBeNull();
      expect(numberingService._extractNumber(null)).toBeNull();
      expect(numberingService._extractNumber(undefined)).toBeNull();
    });

    it('should accept numbers without # prefix (lenient parsing)', () => {
      // _extractNumber is lenient for error recovery
      expect(numberingService._extractNumber('001')).toBe(1);
      expect(numberingService._extractNumber('042')).toBe(42);
      expect(numberingService._extractNumber('100')).toBe(100);
    });

    it('should return null for zero or negative numbers', () => {
      expect(numberingService._extractNumber('#000')).toBeNull();
      expect(numberingService._extractNumber('#-5')).toBeNull();
    });

    it('should handle leading zeros correctly', () => {
      expect(numberingService._extractNumber('#001')).toBe(1);
      expect(numberingService._extractNumber('#0042')).toBe(42);
    });
  });

  describe('validateFormat()', () => {
    it('should validate properly formatted numbers', () => {
      expect(numberingService.validateFormat('#001')).toBe(true);
      expect(numberingService.validateFormat('#042')).toBe(true);
      expect(numberingService.validateFormat('#100')).toBe(true);
      expect(numberingService.validateFormat('#999')).toBe(true);
    });

    it('should reject invalid formats', () => {
      expect(numberingService.validateFormat('001')).toBe(false); // Missing #
      expect(numberingService.validateFormat('#ABC')).toBe(false); // Not a number
      expect(numberingService.validateFormat('#')).toBe(false); // No number
      expect(numberingService.validateFormat('invalid')).toBe(false);
      expect(numberingService.validateFormat('')).toBe(false);
      expect(numberingService.validateFormat(null)).toBe(false);
      expect(numberingService.validateFormat(undefined)).toBe(false);
    });

    it('should reject zero and negative numbers', () => {
      expect(numberingService.validateFormat('#000')).toBe(false);
      expect(numberingService.validateFormat('#-5')).toBe(false);
    });
  });

  describe('reformat()', () => {
    it('should reformat inconsistently padded numbers', () => {
      expect(numberingService.reformat('#1')).toBe('#001');
      expect(numberingService.reformat('#42')).toBe('#042');
      expect(numberingService.reformat('#5')).toBe('#005');
    });

    it('should preserve correctly formatted numbers', () => {
      expect(numberingService.reformat('#001')).toBe('#001');
      expect(numberingService.reformat('#042')).toBe('#042');
      expect(numberingService.reformat('#100')).toBe('#100');
    });

    it('should return null for invalid formats', () => {
      expect(numberingService.reformat('#ABC')).toBeNull();
      expect(numberingService.reformat('invalid')).toBeNull();
      expect(numberingService.reformat(null)).toBeNull();
    });

    it('should reformat numbers without # prefix', () => {
      // reformat uses _extractNumber which is lenient
      expect(numberingService.reformat('001')).toBe('#001');
      expect(numberingService.reformat('42')).toBe('#042');
      expect(numberingService.reformat('5')).toBe('#005');
    });

    it('should handle leading zeros', () => {
      expect(numberingService.reformat('#0001')).toBe('#001');
      expect(numberingService.reformat('#00042')).toBe('#042');
    });
  });

  describe('getCurrentNumberForClient()', () => {
    it('should return highest existing number', async () => {
      changeOrderHistory.getAllForClient.mockResolvedValue([
        { changeOrderNumber: '#001' },
        { changeOrderNumber: '#005' },
        { changeOrderNumber: '#003' }
      ]);

      const result = await numberingService.getCurrentNumberForClient('client@test.com');

      expect(result).toBe('#005');
    });

    it('should return null for client with no history', async () => {
      changeOrderHistory.getAllForClient.mockResolvedValue([]);

      const result = await numberingService.getCurrentNumberForClient('newclient@test.com');

      expect(result).toBeNull();
    });

    it('should return null if all numbers are invalid', async () => {
      changeOrderHistory.getAllForClient.mockResolvedValue([
        { changeOrderNumber: 'invalid' },
        { changeOrderNumber: '#ABC' }
      ]);

      const result = await numberingService.getCurrentNumberForClient('client@test.com');

      expect(result).toBeNull();
    });

    it('should handle history lookup errors', async () => {
      changeOrderHistory.getAllForClient.mockRejectedValue(new Error('Storage error'));

      const result = await numberingService.getCurrentNumberForClient('client@test.com');

      expect(result).toBeNull();
    });
  });

  describe('Integration - Sequential Numbering Workflow', () => {
    it('should generate proper sequence for new client', async () => {
      // First order
      changeOrderHistory.getAllForClient.mockResolvedValue([]);
      const num1 = await numberingService.getNextNumberForClient('client@test.com');
      expect(num1).toBe('#001');

      // Second order
      changeOrderHistory.getAllForClient.mockResolvedValue([
        { changeOrderNumber: '#001' }
      ]);
      const num2 = await numberingService.getNextNumberForClient('client@test.com');
      expect(num2).toBe('#002');

      // Third order
      changeOrderHistory.getAllForClient.mockResolvedValue([
        { changeOrderNumber: '#001' },
        { changeOrderNumber: '#002' }
      ]);
      const num3 = await numberingService.getNextNumberForClient('client@test.com');
      expect(num3).toBe('#003');
    });

    it('should maintain separate sequences per client', async () => {
      // Client 1 has 3 orders
      changeOrderHistory.getAllForClient.mockResolvedValueOnce([
        { changeOrderNumber: '#001' },
        { changeOrderNumber: '#002' },
        { changeOrderNumber: '#003' }
      ]);
      const client1Next = await numberingService.getNextNumberForClient('client1@test.com');
      expect(client1Next).toBe('#004');

      // Client 2 is new
      changeOrderHistory.getAllForClient.mockResolvedValueOnce([]);
      const client2Next = await numberingService.getNextNumberForClient('client2@test.com');
      expect(client2Next).toBe('#001');
    });
  });

  describe('Padding Constant', () => {
    it('should export NUMBER_PADDING constant', () => {
      expect(NUMBER_PADDING).toBe(3);
    });
  });
});
