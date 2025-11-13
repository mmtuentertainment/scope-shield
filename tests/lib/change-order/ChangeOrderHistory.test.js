/**
 * ChangeOrderHistory Tests
 *
 * Tests for change order history storage, per-client indexing, and FIFO deletion.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ChangeOrderHistoryService, MAX_ORDERS_PER_CLIENT } from '../../../src/lib/change-order/ChangeOrderHistory.js';
import { ChangeOrder } from '../../../src/lib/change-order/ChangeOrder.js';

describe('ChangeOrderHistory', () => {
  let historyService;
  let mockStorage;

  beforeEach(() => {
    historyService = new ChangeOrderHistoryService();

    // Mock chrome.storage.local
    mockStorage = {
      data: {},
      get: vi.fn((key) => {
        return Promise.resolve({ [key]: mockStorage.data[key] || {} });
      }),
      set: vi.fn((data) => {
        Object.assign(mockStorage.data, data);
        return Promise.resolve();
      }),
      remove: vi.fn((key) => {
        delete mockStorage.data[key];
        return Promise.resolve();
      })
    };

    global.chrome = {
      storage: {
        local: mockStorage
      }
    };
  });

  describe('getLastForClient()', () => {
    it('should return most recent change order for client', async () => {
      const clientEmail = 'client@test.com';
      const order1 = new ChangeOrder({
        changeOrderNumber: '#001',
        clientName: 'Test Client',
        clientEmail: clientEmail,
        freelancerName: 'John Doe',
        dateCreated: 'January 1, 2025',
        originalScope: 'Build website',
        requestedChanges: ['Add blog'],
        costEstimate: '$500',
        revisedTimeline: '2 weeks',
        paymentTerms: 'Net 30',
        additionalNotes: '',
        status: 'generated'
      });

      const order2 = new ChangeOrder({
        changeOrderNumber: '#002',
        clientName: 'Test Client',
        clientEmail: clientEmail,
        freelancerName: 'John Doe',
        dateCreated: 'January 5, 2025',
        originalScope: 'Build website',
        requestedChanges: ['Add contact form'],
        costEstimate: '$300',
        revisedTimeline: '1 week',
        paymentTerms: 'Net 30',
        additionalNotes: '',
        status: 'generated'
      });

      // Mock storage with two orders
      mockStorage.data['scopeshield_changeorder_history_v1'] = {
        [clientEmail]: [order1.toJSON(), order2.toJSON()]
      };

      const result = await historyService.getLastForClient(clientEmail);

      expect(result).not.toBeNull();
      expect(result.changeOrderNumber).toBe('#002');
      expect(result.clientEmail).toBe(clientEmail);
    });

    it('should return null for client with no history', async () => {
      const result = await historyService.getLastForClient('newclient@test.com');

      expect(result).toBeNull();
    });

    it('should return null for invalid email', async () => {
      const result1 = await historyService.getLastForClient(null);
      const result2 = await historyService.getLastForClient('');
      const result3 = await historyService.getLastForClient(123);

      expect(result1).toBeNull();
      expect(result2).toBeNull();
      expect(result3).toBeNull();
    });

    it('should handle storage errors gracefully', async () => {
      mockStorage.get = vi.fn(() => Promise.reject(new Error('Storage error')));

      const result = await historyService.getLastForClient('test@test.com');

      expect(result).toBeNull();
    });
  });

  describe('getAllForClient()', () => {
    it('should return all orders for client (newest first)', async () => {
      const clientEmail = 'client@test.com';
      const order1 = new ChangeOrder({
        changeOrderNumber: '#001',
        clientName: 'Test Client',
        clientEmail: clientEmail,
        freelancerName: 'John Doe',
        dateCreated: 'January 1, 2025',
        originalScope: 'Build website',
        requestedChanges: ['Add blog'],
        costEstimate: '$500',
        revisedTimeline: '2 weeks',
        paymentTerms: 'Net 30',
        additionalNotes: '',
        status: 'generated'
      });

      const order2 = new ChangeOrder({
        changeOrderNumber: '#002',
        clientName: 'Test Client',
        clientEmail: clientEmail,
        freelancerName: 'John Doe',
        dateCreated: 'January 5, 2025',
        originalScope: 'Build website',
        requestedChanges: ['Add contact form'],
        costEstimate: '$300',
        revisedTimeline: '1 week',
        paymentTerms: 'Net 30',
        additionalNotes: '',
        status: 'generated'
      });

      // Mock storage with two orders (oldest first in storage)
      mockStorage.data['scopeshield_changeorder_history_v1'] = {
        [clientEmail]: [order1.toJSON(), order2.toJSON()]
      };

      const result = await historyService.getAllForClient(clientEmail);

      expect(result).toHaveLength(2);
      // Should be reversed (newest first)
      expect(result[0].changeOrderNumber).toBe('#002');
      expect(result[1].changeOrderNumber).toBe('#001');
    });

    it('should return empty array for client with no history', async () => {
      const result = await historyService.getAllForClient('newclient@test.com');

      expect(result).toEqual([]);
    });

    it('should return empty array for invalid email', async () => {
      const result = await historyService.getAllForClient(null);

      expect(result).toEqual([]);
    });
  });

  describe('save()', () => {
    it('should save valid change order to client history', async () => {
      const clientEmail = 'client@test.com';
      const order = new ChangeOrder({
        changeOrderNumber: '#001',
        clientName: 'Test Client',
        clientEmail: clientEmail,
        freelancerName: 'John Doe',
        dateCreated: 'January 1, 2025',
        originalScope: 'Build website',
        requestedChanges: ['Add blog'],
        costEstimate: '$500',
        revisedTimeline: '2 weeks',
        paymentTerms: 'Net 30',
        additionalNotes: '',
        status: 'generated'
      });

      const result = await historyService.save(order);

      expect(result).toBe(true);
      expect(mockStorage.set).toHaveBeenCalled();

      // Verify storage structure
      const savedData = mockStorage.data['scopeshield_changeorder_history_v1'];
      expect(savedData[clientEmail]).toBeDefined();
      expect(savedData[clientEmail]).toHaveLength(1);
      expect(savedData[clientEmail][0].changeOrderNumber).toBe('#001');
    });

    it('should enforce FIFO deletion when exceeding 50 orders', async () => {
      const clientEmail = 'client@test.com';

      // Create exactly MAX_ORDERS_PER_CLIENT orders
      const orders = [];
      for (let i = 1; i <= MAX_ORDERS_PER_CLIENT; i++) {
        orders.push({
          id: `order-${i}`,
          changeOrderNumber: `#${String(i).padStart(3, '0')}`,
          clientName: 'Test Client',
          clientEmail: clientEmail,
          freelancerName: 'John Doe',
          dateCreated: `January ${i}, 2025`,
          originalScope: 'Build website',
          requestedChanges: ['Change request'],
          costEstimate: '$100',
          revisedTimeline: '1 week',
          paymentTerms: 'Net 30',
          additionalNotes: '',
          status: 'generated'
        });
      }

      // Pre-populate storage with 50 orders
      mockStorage.data['scopeshield_changeorder_history_v1'] = {
        [clientEmail]: orders
      };

      // Save 51st order
      const newOrder = new ChangeOrder({
        changeOrderNumber: '#051',
        clientName: 'Test Client',
        clientEmail: clientEmail,
        freelancerName: 'John Doe',
        dateCreated: 'January 51, 2025',
        originalScope: 'Build website',
        requestedChanges: ['New change'],
        costEstimate: '$200',
        revisedTimeline: '1 week',
        paymentTerms: 'Net 30',
        additionalNotes: '',
        status: 'generated'
      });

      const result = await historyService.save(newOrder);

      expect(result).toBe(true);

      // Should still have exactly MAX_ORDERS_PER_CLIENT
      const savedData = mockStorage.data['scopeshield_changeorder_history_v1'];
      expect(savedData[clientEmail]).toHaveLength(MAX_ORDERS_PER_CLIENT);

      // First order should be removed (FIFO)
      expect(savedData[clientEmail][0].changeOrderNumber).toBe('#002');

      // Last order should be the new one
      expect(savedData[clientEmail][MAX_ORDERS_PER_CLIENT - 1].changeOrderNumber).toBe('#051');
    });

    it('should reject invalid change order', async () => {
      const result = await historyService.save(null);

      expect(result).toBe(false);
      expect(mockStorage.set).not.toHaveBeenCalled();
    });

    it('should reject change order that fails validation', async () => {
      const invalidOrder = new ChangeOrder({
        changeOrderNumber: '', // Invalid - empty
        clientName: '',
        clientEmail: '', // Invalid - empty
        freelancerName: '',
        dateCreated: '',
        originalScope: '',
        requestedChanges: [],
        costEstimate: '',
        revisedTimeline: '',
        paymentTerms: '',
        additionalNotes: '',
        status: 'generated'
      });

      const result = await historyService.save(invalidOrder);

      expect(result).toBe(false);
    });

    it('should handle storage quota exceeded error', async () => {
      mockStorage.set = vi.fn(() =>
        Promise.reject(new Error('QUOTA_BYTES quota exceeded'))
      );

      const order = new ChangeOrder({
        changeOrderNumber: '#001',
        clientName: 'Test Client',
        clientEmail: 'client@test.com',
        freelancerName: 'John Doe',
        dateCreated: 'January 1, 2025',
        originalScope: 'Build website',
        requestedChanges: ['Add blog'],
        costEstimate: '$500',
        revisedTimeline: '2 weeks',
        paymentTerms: 'Net 30',
        additionalNotes: '',
        status: 'generated'
      });

      const result = await historyService.save(order);

      expect(result).toBe(false);
    });
  });

  describe('getCountForClient()', () => {
    it('should return count of orders for client', async () => {
      const clientEmail = 'client@test.com';
      const orders = [
        { id: '1', changeOrderNumber: '#001', clientEmail },
        { id: '2', changeOrderNumber: '#002', clientEmail },
        { id: '3', changeOrderNumber: '#003', clientEmail }
      ];

      mockStorage.data['scopeshield_changeorder_history_v1'] = {
        [clientEmail]: orders
      };

      const count = await historyService.getCountForClient(clientEmail);

      expect(count).toBe(3);
    });

    it('should return 0 for client with no history', async () => {
      const count = await historyService.getCountForClient('newclient@test.com');

      expect(count).toBe(0);
    });
  });

  describe('getAllClients()', () => {
    it('should return array of all client emails', async () => {
      mockStorage.data['scopeshield_changeorder_history_v1'] = {
        'client1@test.com': [{ id: '1' }],
        'client2@test.com': [{ id: '2' }],
        'client3@test.com': [{ id: '3' }]
      };

      const clients = await historyService.getAllClients();

      expect(clients).toHaveLength(3);
      expect(clients).toContain('client1@test.com');
      expect(clients).toContain('client2@test.com');
      expect(clients).toContain('client3@test.com');
    });

    it('should return empty array when no clients exist', async () => {
      const clients = await historyService.getAllClients();

      expect(clients).toEqual([]);
    });
  });

  describe('deleteAllForClient()', () => {
    it('should delete all orders for specific client', async () => {
      const clientEmail = 'client@test.com';
      mockStorage.data['scopeshield_changeorder_history_v1'] = {
        [clientEmail]: [{ id: '1' }, { id: '2' }],
        'other@test.com': [{ id: '3' }]
      };

      const result = await historyService.deleteAllForClient(clientEmail);

      expect(result).toBe(true);

      const savedData = mockStorage.data['scopeshield_changeorder_history_v1'];
      expect(savedData[clientEmail]).toBeUndefined();
      expect(savedData['other@test.com']).toBeDefined();
    });

    it('should succeed even if client has no orders', async () => {
      const result = await historyService.deleteAllForClient('nonexistent@test.com');

      expect(result).toBe(true);
    });
  });

  describe('clearAll()', () => {
    it('should remove all history from storage', async () => {
      mockStorage.data['scopeshield_changeorder_history_v1'] = {
        'client1@test.com': [{ id: '1' }],
        'client2@test.com': [{ id: '2' }]
      };

      const result = await historyService.clearAll();

      expect(result).toBe(true);
      expect(mockStorage.remove).toHaveBeenCalledWith('scopeshield_changeorder_history_v1');
    });

    it('should handle storage errors gracefully', async () => {
      mockStorage.remove = vi.fn(() => Promise.reject(new Error('Storage error')));

      const result = await historyService.clearAll();

      expect(result).toBe(false);
    });
  });

  describe('Integration - Multiple Clients', () => {
    it('should maintain separate histories per client', async () => {
      const client1Email = 'client1@test.com';
      const client2Email = 'client2@test.com';

      const order1 = new ChangeOrder({
        changeOrderNumber: '#001',
        clientName: 'Client 1',
        clientEmail: client1Email,
        freelancerName: 'John Doe',
        dateCreated: 'January 1, 2025',
        originalScope: 'Build website',
        requestedChanges: ['Add blog'],
        costEstimate: '$500',
        revisedTimeline: '2 weeks',
        paymentTerms: 'Net 30',
        additionalNotes: '',
        status: 'generated'
      });

      const order2 = new ChangeOrder({
        changeOrderNumber: '#001',
        clientName: 'Client 2',
        clientEmail: client2Email,
        freelancerName: 'John Doe',
        dateCreated: 'January 2, 2025',
        originalScope: 'Mobile app',
        requestedChanges: ['Add push notifications'],
        costEstimate: '$800',
        revisedTimeline: '3 weeks',
        paymentTerms: 'Net 30',
        additionalNotes: '',
        status: 'generated'
      });

      await historyService.save(order1);
      await historyService.save(order2);

      const client1Orders = await historyService.getAllForClient(client1Email);
      const client2Orders = await historyService.getAllForClient(client2Email);

      expect(client1Orders).toHaveLength(1);
      expect(client2Orders).toHaveLength(1);
      expect(client1Orders[0].clientEmail).toBe(client1Email);
      expect(client2Orders[0].clientEmail).toBe(client2Email);
    });
  });
});
