import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ChangeOrderBuilder } from '../../../src/lib/change-order/ChangeOrderBuilder.js';

// Mock dependencies
vi.mock('../../../src/lib/storage/FreelancerSettings.js', () => ({
  FreelancerSettings: {
    async load() {
      return {
        freelancerName: 'Test Freelancer',
        hourlyRate: 100,
        currency: 'USD'
      };
    }
  }
}));

describe('ChangeOrderBuilder', () => {
  let builder;

  beforeEach(() => {
    builder = new ChangeOrderBuilder();
  });

  describe('build()', () => {
    it('should generate change order from detections', async () => {
      const detections = [
        {
          sender: 'client@example.com',
          text: 'Can you also add a login page?',
          trigger: 'also',
          date: '2025-01-10T10:00:00Z'
        },
        {
          sender: 'client@example.com',
          text: 'One more thing - add export',
          trigger: 'one more thing',
          date: '2025-01-12T15:30:00Z'
        }
      ];

      const result = await builder.build(detections);

      expect(result).toContain('CHANGE ORDER REQUEST');
      expect(result).toContain('Test Freelancer');
      expect(result).toContain('client@example.com');
      expect(result).toContain('Can you also add a login page?');
      expect(result).toContain('One more thing - add export');
    });

    it('should handle empty detections array', async () => {
      const result = await builder.build([]);

      expect(result).toContain('CHANGE ORDER REQUEST');
      expect(result).toContain('No scope creep detected');
    });

    it('should use provided settings', async () => {
      const detections = [{
        sender: 'client@example.com',
        text: 'Add this feature',
        trigger: 'add',
        date: '2025-01-10T10:00:00Z'
      }];

      const customSettings = {
        freelancerName: 'Custom Name',
        hourlyRate: 150
      };

      const result = await builder.build(detections, customSettings);

      expect(result).toContain('Custom Name');
      expect(result).toContain('$150');
    });

    it('should load default settings if none provided', async () => {
      const detections = [{
        sender: 'client@example.com',
        text: 'Add feature',
        trigger: 'add',
        date: '2025-01-10T10:00:00Z'
      }];

      const result = await builder.build(detections);

      expect(result).toContain('Test Freelancer');
    });
  });

  describe('estimateHours()', () => {
    it('should estimate 2 hours per detection by default', () => {
      const detections = [
        { text: 'Add feature 1' },
        { text: 'Add feature 2' },
        { text: 'Add feature 3' }
      ];

      const hours = builder.estimateHours(detections);

      expect(hours).toBe(6); // 3 detections * 2 hours
    });

    it('should return 0 for empty array', () => {
      const hours = builder.estimateHours([]);
      expect(hours).toBe(0);
    });

    it('should handle single detection', () => {
      const hours = builder.estimateHours([{ text: 'One thing' }]);
      expect(hours).toBe(2);
    });
  });

  describe('calculateCost()', () => {
    it('should calculate cost from hours and rate', () => {
      const cost = builder.calculateCost(10, 100);
      expect(cost).toBe(1000);
    });

    it('should handle zero hours', () => {
      const cost = builder.calculateCost(0, 100);
      expect(cost).toBe(0);
    });

    it('should handle zero rate', () => {
      const cost = builder.calculateCost(10, 0);
      expect(cost).toBe(0);
    });

    it('should handle decimal hours', () => {
      const cost = builder.calculateCost(7.5, 100);
      expect(cost).toBe(750);
    });

    it('should handle undefined rate', () => {
      const cost = builder.calculateCost(10, undefined);
      expect(cost).toBe(0);
    });
  });

  describe('formatDate()', () => {
    it('should format ISO date to readable format', () => {
      const formatted = builder.formatDate('2025-01-15T10:30:00Z');
      expect(formatted).toBe('2025-01-15');
    });

    it('should handle date without time', () => {
      const formatted = builder.formatDate('2025-01-15');
      expect(formatted).toBe('2025-01-15');
    });

    it('should handle invalid date', () => {
      const formatted = builder.formatDate('invalid');
      expect(formatted).toBe('invalid');
    });

    it('should handle missing date', () => {
      const formatted = builder.formatDate(undefined);
      expect(formatted).toBe('Unknown');
    });
  });

  describe('Integration', () => {
    it('should generate complete change order with all details', async () => {
      const detections = [
        {
          sender: 'client@example.com',
          text: 'Can you also add authentication?',
          trigger: 'also',
          date: '2025-01-10T10:00:00Z'
        },
        {
          sender: 'client@example.com',
          text: 'One more thing - add PDF export',
          trigger: 'one more thing',
          date: '2025-01-12T15:30:00Z'
        },
        {
          sender: 'manager@example.com',
          text: 'Additionally, we need dark mode',
          trigger: 'additionally',
          date: '2025-01-13T09:00:00Z'
        }
      ];

      const settings = {
        freelancerName: 'John Developer',
        hourlyRate: 125
      };

      const result = await builder.build(detections, settings);

      // Header
      expect(result).toContain('CHANGE ORDER REQUEST');
      expect(result).toContain('John Developer');

      // All detections
      expect(result).toContain('authentication');
      expect(result).toContain('PDF export');
      expect(result).toContain('dark mode');

      // Multiple senders
      expect(result).toContain('client@example.com');
      expect(result).toContain('manager@example.com');

      // Cost calculation
      expect(result).toContain('6 hours'); // 3 detections * 2 hours
      expect(result).toContain('$750'); // 6 hours * $125/hr
    });

    it('should handle change order without hourly rate', async () => {
      const detections = [{
        sender: 'client@example.com',
        text: 'Add feature',
        trigger: 'add',
        date: '2025-01-10T10:00:00Z'
      }];

      const settings = {
        freelancerName: 'John Developer'
        // No hourly rate
      };

      const result = await builder.build(detections, settings);

      expect(result).toContain('CHANGE ORDER REQUEST');
      expect(result).toContain('2 hours');
      expect(result).not.toContain('$'); // No cost shown without rate
    });
  });

  describe('Error Handling', () => {
    it('should throw error for null detections', async () => {
      await expect(builder.build(null)).rejects.toThrow('Detections array is required');
    });

    it('should throw error for undefined detections', async () => {
      await expect(builder.build(undefined)).rejects.toThrow('Detections array is required');
    });

    it('should throw error for non-array detections', async () => {
      await expect(builder.build('not an array')).rejects.toThrow('Detections must be an array');
    });

    it('should throw error for non-object settings', async () => {
      const detections = [{ sender: 'test', text: 'test', trigger: 'test', date: '2025-01-01' }];
      await expect(builder.build(detections, 'invalid')).rejects.toThrow('Settings must be an object or null');
      await expect(builder.build(detections, 123)).rejects.toThrow('Settings must be an object or null');
      await expect(builder.build(detections, [])).rejects.toThrow('Settings must be an object or null');
    });

    it('should handle detections with missing fields gracefully', async () => {
      const detections = [
        { sender: 'client@example.com' }, // Missing text, trigger, date
        { text: 'Some text' } // Missing sender, trigger, date
      ];

      const result = await builder.build(detections);

      expect(result).toContain('CHANGE ORDER REQUEST');
      // Should not crash, should handle missing fields
    });

    it('should handle invalid dates in detections', async () => {
      const detections = [
        { sender: 'client@example.com', text: 'Test', trigger: 'test', date: 'invalid-date' }
      ];

      const result = await builder.build(detections);

      expect(result).toContain('CHANGE ORDER REQUEST');
      // Should handle invalid date gracefully
    });
  });

  describe('Performance', () => {
    it('should build change order in less than 5 seconds for 50 detections', async () => {
      const detections = Array.from({ length: 50 }, (_, i) => ({
        sender: `client${i % 5}@example.com`,
        text: `Request ${i}: Can you also add feature ${i}?`,
        trigger: 'also',
        date: `2025-01-${String((i % 28) + 1).padStart(2, '0')}T10:00:00Z`
      }));

      const start = performance.now();
      const result = await builder.build(detections);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(5000);
      expect(result).toContain('CHANGE ORDER REQUEST');
      expect(result).toContain('50'); // Should show all 50 items
    });
  });
});
