/**
 * ChangeOrderService Tests
 *
 * Tests for change order generation, multi-item bundling, and data integration.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ChangeOrderServiceClass } from '../../../src/lib/change-order/ChangeOrderService.js';
import { ChangeOrder } from '../../../src/lib/change-order/ChangeOrder.js';
import changeOrderHistory from '../../../src/lib/change-order/ChangeOrderHistory.js';
import changeOrderNumbering from '../../../src/lib/change-order/ChangeOrderNumbering.js';
import { SettingsStorage } from '../../../src/lib/storage/SettingsStorage.js';

describe('ChangeOrderService', () => {
  let service;

  beforeEach(() => {
    service = new ChangeOrderServiceClass();

    // Mock dependencies
    vi.spyOn(changeOrderHistory, 'save').mockResolvedValue(true);
    vi.spyOn(changeOrderHistory, 'getLastForClient').mockResolvedValue(null);
    vi.spyOn(changeOrderNumbering, 'getNextNumberForClient').mockResolvedValue('#001');
    vi.spyOn(SettingsStorage, 'get').mockResolvedValue({
      freelancerName: 'John Doe'
    });

    // Mock performance.now()
    global.performance = {
      now: vi.fn(() => Date.now())
    };
  });

  describe('generate() - Single Detection', () => {
    it('should generate change order from single detection event', async () => {
      const detectionEvent = {
        sender: {
          name: 'Acme Corp',
          email: 'client@acme.com'
        },
        detectedText: 'Can you add a contact form to the homepage?',
        timestamp: Date.now(),
        id: 'detection-1'
      };

      const result = await service.generate(detectionEvent);

      expect(result).toBeInstanceOf(ChangeOrder);
      expect(result.clientName).toBe('Acme Corp');
      expect(result.clientEmail).toBe('client@acme.com');
      expect(result.freelancerName).toBe('John Doe');
      expect(result.changeOrderNumber).toBe('#001');
      expect(result.requestedChanges).toHaveLength(1);
      expect(result.requestedChanges[0]).toBe('Can you add a contact form to the homepage?');
      expect(result.status).toBe('generated');
    });

    it('should save change order to history', async () => {
      const detectionEvent = {
        sender: {
          name: 'Acme Corp',
          email: 'client@acme.com'
        },
        detectedText: 'Add dark mode support',
        timestamp: Date.now(),
        id: 'detection-1'
      };

      await service.generate(detectionEvent);

      expect(changeOrderHistory.save).toHaveBeenCalledTimes(1);
      const savedOrder = changeOrderHistory.save.mock.calls[0][0];
      expect(savedOrder).toBeInstanceOf(ChangeOrder);
    });

    it('should continue if history save fails', async () => {
      changeOrderHistory.save.mockResolvedValue(false);

      const detectionEvent = {
        sender: {
          name: 'Acme Corp',
          email: 'client@acme.com'
        },
        detectedText: 'Add feature',
        timestamp: Date.now(),
        id: 'detection-1'
      };

      // Should not throw
      const result = await service.generate(detectionEvent);

      expect(result).toBeInstanceOf(ChangeOrder);
    });
  });

  describe('generate() - Multi-Item Bundling', () => {
    it('should generate change order from multiple detection events', async () => {
      const detectionEvents = [
        {
          sender: {
            name: 'Acme Corp',
            email: 'client@acme.com'
          },
          detectedText: 'Add contact form',
          timestamp: Date.now(),
          id: 'detection-1'
        },
        {
          sender: {
            name: 'Acme Corp',
            email: 'client@acme.com'
          },
          detectedText: 'Add newsletter signup',
          timestamp: Date.now() + 1000,
          id: 'detection-2'
        },
        {
          sender: {
            name: 'Acme Corp',
            email: 'client@acme.com'
          },
          detectedText: 'Implement dark mode',
          timestamp: Date.now() + 2000,
          id: 'detection-3'
        }
      ];

      const result = await service.generate(detectionEvents);

      expect(result).toBeInstanceOf(ChangeOrder);
      expect(result.requestedChanges).toHaveLength(3);
      expect(result.requestedChanges[0]).toBe('Add contact form');
      expect(result.requestedChanges[1]).toBe('Add newsletter signup');
      expect(result.requestedChanges[2]).toBe('Implement dark mode');
    });

    it('should use client info from first detection', async () => {
      const detectionEvents = [
        {
          sender: {
            name: 'First Client',
            email: 'first@test.com'
          },
          detectedText: 'Change 1',
          timestamp: Date.now(),
          id: 'detection-1'
        },
        {
          sender: {
            name: 'Second Client', // Different - should be ignored
            email: 'second@test.com'
          },
          detectedText: 'Change 2',
          timestamp: Date.now() + 1000,
          id: 'detection-2'
        }
      ];

      const result = await service.generate(detectionEvents);

      // Should use first detection's client info
      expect(result.clientName).toBe('First Client');
      expect(result.clientEmail).toBe('first@test.com');
    });

    it('should throw error if array is empty', async () => {
      await expect(service.generate([])).rejects.toThrow(
        'At least one detection event is required'
      );
    });
  });

  describe('generate() - Freelancer Name', () => {
    it('should load freelancer name from settings', async () => {
      SettingsStorage.get.mockResolvedValue({
        freelancerName: 'Jane Smith'
      });

      const detectionEvent = {
        sender: { name: 'Client', email: 'client@test.com' },
        detectedText: 'Add feature',
        timestamp: Date.now(),
        id: 'detection-1'
      };

      const result = await service.generate(detectionEvent);

      expect(result.freelancerName).toBe('Jane Smith');
    });

    it('should use options.freelancerName over settings', async () => {
      SettingsStorage.get.mockResolvedValue({
        freelancerName: 'Jane Smith'
      });

      const detectionEvent = {
        sender: { name: 'Client', email: 'client@test.com' },
        detectedText: 'Add feature',
        timestamp: Date.now(),
        id: 'detection-1'
      };

      const result = await service.generate(detectionEvent, {
        freelancerName: 'Override Name'
      });

      expect(result.freelancerName).toBe('Override Name');
    });

    it('should use placeholder if no freelancer name available', async () => {
      SettingsStorage.get.mockResolvedValue({});

      const detectionEvent = {
        sender: { name: 'Client', email: 'client@test.com' },
        detectedText: 'Add feature',
        timestamp: Date.now(),
        id: 'detection-1'
      };

      const result = await service.generate(detectionEvent);

      expect(result.freelancerName).toBe('Your Name');
    });

    it('should handle settings load error gracefully', async () => {
      SettingsStorage.get.mockRejectedValue(new Error('Storage error'));

      const detectionEvent = {
        sender: { name: 'Client', email: 'client@test.com' },
        detectedText: 'Add feature',
        timestamp: Date.now(),
        id: 'detection-1'
      };

      const result = await service.generate(detectionEvent);

      expect(result.freelancerName).toBe('Your Name'); // Fallback
    });
  });

  describe('generate() - Original Scope Pre-fill', () => {
    it('should pre-fill original scope from history for repeat clients', async () => {
      const previousOrder = new ChangeOrder({
        changeOrderNumber: '#001',
        clientName: 'Acme Corp',
        clientEmail: 'client@acme.com',
        freelancerName: 'John Doe',
        dateCreated: 'January 1, 2025',
        originalScope: 'Build e-commerce website with payment integration',
        requestedChanges: ['Add blog'],
        costEstimate: '$500',
        revisedTimeline: '2 weeks',
        paymentTerms: 'Net 30',
        additionalNotes: '',
        status: 'generated'
      });

      changeOrderHistory.getLastForClient.mockResolvedValue(previousOrder);

      const detectionEvent = {
        sender: { name: 'Acme Corp', email: 'client@acme.com' },
        detectedText: 'Add newsletter',
        timestamp: Date.now(),
        id: 'detection-1'
      };

      const result = await service.generate(detectionEvent);

      expect(result.originalScope).toBe('Build e-commerce website with payment integration');
    });

    it('should use empty original scope for first-time clients', async () => {
      changeOrderHistory.getLastForClient.mockResolvedValue(null);

      const detectionEvent = {
        sender: { name: 'New Client', email: 'new@test.com' },
        detectedText: 'Build website',
        timestamp: Date.now(),
        id: 'detection-1'
      };

      const result = await service.generate(detectionEvent);

      expect(result.originalScope).toBe('');
    });

    it('should use options.originalScope over history', async () => {
      const previousOrder = new ChangeOrder({
        changeOrderNumber: '#001',
        clientName: 'Acme Corp',
        clientEmail: 'client@acme.com',
        freelancerName: 'John Doe',
        dateCreated: 'January 1, 2025',
        originalScope: 'Old scope from history',
        requestedChanges: ['Add blog'],
        costEstimate: '$500',
        revisedTimeline: '2 weeks',
        paymentTerms: 'Net 30',
        additionalNotes: '',
        status: 'generated'
      });

      changeOrderHistory.getLastForClient.mockResolvedValue(previousOrder);

      const detectionEvent = {
        sender: { name: 'Acme Corp', email: 'client@acme.com' },
        detectedText: 'Add feature',
        timestamp: Date.now(),
        id: 'detection-1'
      };

      const result = await service.generate(detectionEvent, {
        originalScope: 'Override scope'
      });

      expect(result.originalScope).toBe('Override scope');
    });

    it('should handle history load error gracefully', async () => {
      changeOrderHistory.getLastForClient.mockRejectedValue(new Error('Storage error'));

      const detectionEvent = {
        sender: { name: 'Client', email: 'client@test.com' },
        detectedText: 'Add feature',
        timestamp: Date.now(),
        id: 'detection-1'
      };

      const result = await service.generate(detectionEvent);

      expect(result.originalScope).toBe(''); // Fallback
    });
  });

  describe('generate() - Sequential Numbering', () => {
    it('should get next number for client', async () => {
      changeOrderNumbering.getNextNumberForClient.mockResolvedValue('#042');

      const detectionEvent = {
        sender: { name: 'Client', email: 'client@test.com' },
        detectedText: 'Add feature',
        timestamp: Date.now(),
        id: 'detection-1'
      };

      const result = await service.generate(detectionEvent);

      expect(result.changeOrderNumber).toBe('#042');
      expect(changeOrderNumbering.getNextNumberForClient).toHaveBeenCalledWith('client@test.com');
    });
  });

  describe('generate() - Text Truncation', () => {
    it('should truncate very long detected text', async () => {
      const longText = 'A'.repeat(600); // Exceeds MAX_DETECTED_TEXT_LENGTH (500)

      const detectionEvent = {
        sender: { name: 'Client', email: 'client@test.com' },
        detectedText: longText,
        timestamp: Date.now(),
        id: 'detection-1'
      };

      const result = await service.generate(detectionEvent);

      // Bug #4 fix: Service now correctly truncates to 200 chars + "..." = 203 chars
      expect(result.requestedChanges[0]).toHaveLength(203);
      expect(result.requestedChanges[0].endsWith('...')).toBe(true);
    });

    it('should not truncate normal-length text', async () => {
      const normalText = 'Add contact form to homepage';

      const detectionEvent = {
        sender: { name: 'Client', email: 'client@test.com' },
        detectedText: normalText,
        timestamp: Date.now(),
        id: 'detection-1'
      };

      const result = await service.generate(detectionEvent);

      expect(result.requestedChanges[0]).toBe(normalText);
    });
  });

  describe('generate() - Missing Data Handling', () => {
    it('should use email as fallback for missing sender name', async () => {
      const detectionEvent = {
        sender: {
          email: 'client@test.com'
          // name missing
        },
        detectedText: 'Add feature',
        timestamp: Date.now(),
        id: 'detection-1'
      };

      const result = await service.generate(detectionEvent);

      // Implementation uses email as fallback when name is missing
      expect(result.clientName).toBe('client@test.com');
    });

    it('should use placeholder for missing sender email', async () => {
      const detectionEvent = {
        sender: {
          name: 'Client Name'
          // email missing
        },
        detectedText: 'Add feature',
        timestamp: Date.now(),
        id: 'detection-1'
      };

      const result = await service.generate(detectionEvent);

      expect(result.clientEmail).toBe('unknown@client.com'); // Placeholder
    });

    it('should use placeholder for missing detected text', async () => {
      const detectionEvent = {
        sender: {
          name: 'Client Name',
          email: 'client@test.com'
        },
        detectedText: '',
        timestamp: Date.now(),
        id: 'detection-1'
      };

      const result = await service.generate(detectionEvent);

      expect(result.requestedChanges).toEqual(['No specific changes detected']);
    });

    it('should handle completely missing sender', async () => {
      const detectionEvent = {
        detectedText: 'Add feature',
        timestamp: Date.now(),
        id: 'detection-1'
      };

      const result = await service.generate(detectionEvent);

      expect(result.clientName).toBe('Client');
      expect(result.clientEmail).toBe('unknown@client.com');
    });
  });

  describe('generate() - Default Values', () => {
    it('should set default cost estimate placeholder', async () => {
      const detectionEvent = {
        sender: { name: 'Client', email: 'client@test.com' },
        detectedText: 'Add feature',
        timestamp: Date.now(),
        id: 'detection-1'
      };

      const result = await service.generate(detectionEvent);

      expect(result.costEstimate).toBe('$XXX');
    });

    it('should set empty revised timeline', async () => {
      const detectionEvent = {
        sender: { name: 'Client', email: 'client@test.com' },
        detectedText: 'Add feature',
        timestamp: Date.now(),
        id: 'detection-1'
      };

      const result = await service.generate(detectionEvent);

      expect(result.revisedTimeline).toBe('');
    });

    it('should set default payment terms', async () => {
      const detectionEvent = {
        sender: { name: 'Client', email: 'client@test.com' },
        detectedText: 'Add feature',
        timestamp: Date.now(),
        id: 'detection-1'
      };

      const result = await service.generate(detectionEvent);

      expect(result.paymentTerms).toBe('Net 30');
    });

    it('should set status to "generated"', async () => {
      const detectionEvent = {
        sender: { name: 'Client', email: 'client@test.com' },
        detectedText: 'Add feature',
        timestamp: Date.now(),
        id: 'detection-1'
      };

      const result = await service.generate(detectionEvent);

      expect(result.status).toBe('generated');
    });
  });

  describe('generate() - Performance Tracking', () => {
    it('should log warning if generation exceeds 5s', async () => {
      let callCount = 0;
      global.performance.now = vi.fn(() => {
        if (callCount === 0) {
          callCount++;
          return 0; // Start time
        }
        return 5500; // End time - exceeds 5000ms threshold
      });

      const detectionEvent = {
        sender: { name: 'Client', email: 'client@test.com' },
        detectedText: 'Add feature',
        timestamp: Date.now(),
        id: 'detection-1'
      };

      // Should not throw - just log warning
      const result = await service.generate(detectionEvent);

      expect(result).toBeInstanceOf(ChangeOrder);
    });
  });

  describe('createManual()', () => {
    it('should create change order from manual data', async () => {
      const data = {
        clientName: 'Acme Corp',
        clientEmail: 'client@acme.com',
        requestedChanges: ['Add contact form', 'Add newsletter'],
        originalScope: 'Build website'
      };

      const result = await service.createManual(data);

      expect(result).toBeInstanceOf(ChangeOrder);
      expect(result.clientName).toBe('Acme Corp');
      expect(result.clientEmail).toBe('client@acme.com');
      // createManual joins array with \n, so it becomes a single string in requestedChanges
      expect(result.requestedChanges).toHaveLength(1);
      expect(result.requestedChanges[0]).toContain('Add contact form');
      expect(result.requestedChanges[0]).toContain('Add newsletter');
      expect(result.originalScope).toBe('Build website');
    });

    it('should use placeholder text if no requested changes', async () => {
      const data = {
        clientName: 'Acme Corp',
        clientEmail: 'client@acme.com'
        // requestedChanges missing
      };

      const result = await service.createManual(data);

      expect(result.requestedChanges[0]).toContain('Manual change order request');
    });
  });

  describe('validateDetectionEvent()', () => {
    it('should validate proper detection event', () => {
      const detectionEvent = {
        sender: { name: 'Client', email: 'client@test.com' },
        detectedText: 'Add feature'
      };

      const result = service.validateDetectionEvent(detectionEvent);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject non-object', () => {
      const result = service.validateDetectionEvent(null);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Detection event must be an object');
    });

    it('should reject missing sender', () => {
      const detectionEvent = {
        detectedText: 'Add feature'
        // sender missing
      };

      const result = service.validateDetectionEvent(detectionEvent);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Detection event must have sender object');
    });

    it('should reject missing detectedText', () => {
      const detectionEvent = {
        sender: { name: 'Client', email: 'client@test.com' }
        // detectedText missing
      };

      const result = service.validateDetectionEvent(detectionEvent);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Detection event must have detectedText string');
    });

    it('should reject invalid sender type', () => {
      const detectionEvent = {
        sender: 'invalid', // Should be object
        detectedText: 'Add feature'
      };

      const result = service.validateDetectionEvent(detectionEvent);

      expect(result.valid).toBe(false);
    });

    it('should reject invalid detectedText type', () => {
      const detectionEvent = {
        sender: { name: 'Client', email: 'client@test.com' },
        detectedText: 123 // Should be string
      };

      const result = service.validateDetectionEvent(detectionEvent);

      expect(result.valid).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should throw error if change order validation fails', async () => {
      // Mock to generate invalid change order (shouldn't happen in practice)
      changeOrderNumbering.getNextNumberForClient.mockResolvedValue(''); // Invalid

      const detectionEvent = {
        sender: { name: '', email: '' }, // Will create invalid order
        detectedText: '',
        timestamp: Date.now(),
        id: 'detection-1'
      };

      await expect(service.generate(detectionEvent)).rejects.toThrow(
        'Change order validation failed'
      );
    });

    it('should log error and rethrow on unexpected errors', async () => {
      changeOrderNumbering.getNextNumberForClient.mockRejectedValue(
        new Error('Unexpected error')
      );

      const detectionEvent = {
        sender: { name: 'Client', email: 'client@test.com' },
        detectedText: 'Add feature',
        timestamp: Date.now(),
        id: 'detection-1'
      };

      await expect(service.generate(detectionEvent)).rejects.toThrow('Unexpected error');
    });
  });
});
