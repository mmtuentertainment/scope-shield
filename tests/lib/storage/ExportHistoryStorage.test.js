/**
 * ExportHistoryStorage Tests
 * Comprehensive test coverage for export history tracking
 */
/* global chrome */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExportHistoryStorage } from '../../../src/lib/storage/ExportHistoryStorage.js';
import { STORAGE_KEYS } from '../../../src/lib/storage/StorageSchemas.js';

describe('ExportHistoryStorage', () => {
  beforeEach(() => {
    // Chrome storage is already mocked and reset in setup.js
    chrome.storage.local.data = {};
  });

  describe('save', () => {
    it('should save export event to history', async () => {
      const exportEvent = {
        method: 'pdf',
        metadata: {
          clientName: 'Acme Corp',
          freelancerName: 'Jane Doe',
          totalCost: 1250
        },
        duration: 1234
      };

      await ExportHistoryStorage.save(exportEvent);

      const history = chrome.storage.local.data[STORAGE_KEYS.EXPORT_HISTORY];
      expect(history).toHaveLength(1);
      expect(history[0].method).toBe('pdf');
      expect(history[0].clientName).toBe('Acme Corp');
      expect(history[0].freelancerName).toBe('Jane Doe');
      expect(history[0].totalCost).toBe(1250);
      expect(history[0].duration).toBe(1234);
      expect(history[0].exportedAt).toBeDefined();
      expect(history[0].id).toBeDefined();
    });

    it('should add new entries to the beginning (most recent first)', async () => {
      const event1 = {
        method: 'pdf',
        metadata: { clientName: 'Client 1' }
      };

      const event2 = {
        method: 'clipboard',
        metadata: { clientName: 'Client 2' }
      };

      await ExportHistoryStorage.save(event1);
      await ExportHistoryStorage.save(event2);

      const history = chrome.storage.local.data[STORAGE_KEYS.EXPORT_HISTORY];
      expect(history).toHaveLength(2);
      expect(history[0].clientName).toBe('Client 2'); // Most recent first
      expect(history[1].clientName).toBe('Client 1');
    });

    it('should enforce 100-entry limit with FIFO deletion', async () => {
      // Pre-populate with 100 entries
      const oldHistory = Array.from({ length: 100 }, (_, i) => ({
        id: `old-${i}`,
        method: 'pdf',
        clientName: `Client ${i}`,
        exportedAt: new Date(Date.now() - i * 1000).toISOString()
      }));

      chrome.storage.local.data[STORAGE_KEYS.EXPORT_HISTORY] = oldHistory;

      // Save new entry (101st)
      await ExportHistoryStorage.save({
        method: 'clipboard',
        metadata: { clientName: 'New Client' }
      });

      const history = chrome.storage.local.data[STORAGE_KEYS.EXPORT_HISTORY];
      expect(history).toHaveLength(100); // Still 100
      expect(history[0].clientName).toBe('New Client'); // Most recent
      expect(history[history.length - 1].id).not.toBe('old-99'); // Oldest removed
    });

    it('should use default values for missing metadata fields', async () => {
      const exportEvent = {
        method: 'text'
        // No metadata
      };

      await ExportHistoryStorage.save(exportEvent);

      const history = chrome.storage.local.data[STORAGE_KEYS.EXPORT_HISTORY];
      expect(history[0].clientName).toBe('Unknown');
      expect(history[0].freelancerName).toBe('');
      expect(history[0].totalCost).toBe(0);
      expect(history[0].duration).toBe(0);
    });

    it('should reject invalid export event (missing method)', async () => {
      const invalidEvent = {
        metadata: { clientName: 'Test' }
        // No method
      };

      await expect(ExportHistoryStorage.save(invalidEvent)).rejects.toThrow('Invalid export event: missing method');
    });

    it('should reject null or empty export event', async () => {
      await expect(ExportHistoryStorage.save(null)).rejects.toThrow('Invalid export event');
      await expect(ExportHistoryStorage.save({})).rejects.toThrow('Invalid export event');
    });

    it('should handle storage quota exceeded with emergency cleanup', async () => {
      let callCount = 0;

      // Mock quota exceeded on first call, success on second
      const originalSet = chrome.storage.local.set;
      chrome.storage.local.set = vi.fn((data, callback) => {
        callCount++;
        if (callCount === 1) {
          // First call: quota exceeded
          chrome.runtime.lastError = { message: 'QUOTA_BYTES quota exceeded' };
          callback();
          chrome.runtime.lastError = null;
        } else {
          // Second call (emergency cleanup): success
          chrome.runtime.lastError = null; // Clear error BEFORE callback
          chrome.storage.local.data = data;
          callback();
        }
      });

      // Restore after test
      const restoreMock = () => {
        chrome.storage.local.set = originalSet;
      };

      // Pre-populate with 80 entries
      const mockHistory = Array.from({ length: 80 }, (_, i) => ({
        id: `entry-${i}`,
        method: 'pdf',
        clientName: `Client ${i}`
      }));

      chrome.storage.local.data[STORAGE_KEYS.EXPORT_HISTORY] = mockHistory;

      try {
        await ExportHistoryStorage.save({
          method: 'clipboard',
          metadata: { clientName: 'New Client' }
        });

        // Should have triggered emergency cleanup to 50 entries
        const history = chrome.storage.local.data[STORAGE_KEYS.EXPORT_HISTORY];
        expect(history).toHaveLength(50);
      } finally {
        restoreMock();
      }
    });
  });

  describe('getAll', () => {
    it('should return all history entries', async () => {
      const mockHistory = [
        { id: '1', method: 'pdf', clientName: 'Client A' },
        { id: '2', method: 'clipboard', clientName: 'Client B' },
        { id: '3', method: 'text', clientName: 'Client C' }
      ];

      chrome.storage.local.data[STORAGE_KEYS.EXPORT_HISTORY] = mockHistory;

      const result = await ExportHistoryStorage.getAll();

      expect(result).toEqual(mockHistory);
      expect(result).toHaveLength(3);
    });

    it('should return empty array if no history exists', async () => {
      const result = await ExportHistoryStorage.getAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should reject on chrome.storage error', async () => {
      chrome.storage.local.get.mockImplementationOnce((keys, callback) => {
        chrome.runtime.lastError = { message: 'Storage error' };
        callback({});
        chrome.runtime.lastError = null;
      });

      await expect(ExportHistoryStorage.getAll()).rejects.toThrow('Storage error');
    });
  });

  describe('getByClient', () => {
    beforeEach(async () => {
      const mockHistory = [
        { id: '1', method: 'pdf', clientName: 'Acme Corp' },
        { id: '2', method: 'clipboard', clientName: 'Widget Inc' },
        { id: '3', method: 'text', clientName: 'Acme Corp' },
        { id: '4', method: 'pdf', clientName: 'TechStart LLC' }
      ];

      chrome.storage.local.data[STORAGE_KEYS.EXPORT_HISTORY] = mockHistory;
    });

    it('should filter history by exact client name', async () => {
      const result = await ExportHistoryStorage.getByClient('Acme Corp');

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('3');
    });

    it('should filter history case-insensitively', async () => {
      const result = await ExportHistoryStorage.getByClient('acme corp');

      expect(result).toHaveLength(2);
    });

    it('should filter history with partial matches', async () => {
      const result = await ExportHistoryStorage.getByClient('Acme');

      expect(result).toHaveLength(2);
    });

    it('should return empty array for non-existent client', async () => {
      const result = await ExportHistoryStorage.getByClient('Nonexistent Client');

      expect(result).toEqual([]);
    });

    it('should trim whitespace from search term', async () => {
      const result = await ExportHistoryStorage.getByClient('  Acme Corp  ');

      expect(result).toHaveLength(2);
    });
  });

  describe('cleanOldest', () => {
    it('should remove oldest N entries', async () => {
      const mockHistory = Array.from({ length: 80 }, (_, i) => ({
        id: `entry-${i}`,
        method: 'pdf',
        clientName: `Client ${i}`,
        exportedAt: new Date(Date.now() - i * 1000).toISOString()
      }));

      chrome.storage.local.data[STORAGE_KEYS.EXPORT_HISTORY] = mockHistory;

      const removed = await ExportHistoryStorage.cleanOldest(30);

      expect(removed).toBe(30);

      const history = chrome.storage.local.data[STORAGE_KEYS.EXPORT_HISTORY];
      expect(history).toHaveLength(50); // 80 - 30
    });

    it('should return 0 if not enough entries to clean', async () => {
      const mockHistory = Array.from({ length: 40 }, (_, i) => ({
        id: `entry-${i}`,
        method: 'pdf'
      }));

      chrome.storage.local.data[STORAGE_KEYS.EXPORT_HISTORY] = mockHistory;

      const removed = await ExportHistoryStorage.cleanOldest(50);

      expect(removed).toBe(0);
      // History unchanged
      expect(chrome.storage.local.data[STORAGE_KEYS.EXPORT_HISTORY]).toHaveLength(40);
    });

    it('should return 0 if history is empty', async () => {
      const removed = await ExportHistoryStorage.cleanOldest(10);

      expect(removed).toBe(0);
    });

    it('should reject on chrome.storage error', async () => {
      chrome.storage.local.get.mockImplementationOnce((keys, callback) => {
        chrome.runtime.lastError = { message: 'Storage error' };
        callback({});
        chrome.runtime.lastError = null;
      });

      await expect(ExportHistoryStorage.cleanOldest(10)).rejects.toThrow('Storage error');
    });
  });

  describe('clear', () => {
    it('should clear all history entries', async () => {
      const mockHistory = Array.from({ length: 10 }, (_, i) => ({
        id: `entry-${i}`,
        method: 'pdf'
      }));

      chrome.storage.local.data[STORAGE_KEYS.EXPORT_HISTORY] = mockHistory;

      await ExportHistoryStorage.clear();

      const history = chrome.storage.local.data[STORAGE_KEYS.EXPORT_HISTORY];
      expect(history).toEqual([]);
    });

    it('should succeed even if history is already empty', async () => {
      await expect(ExportHistoryStorage.clear()).resolves.toBeUndefined();

      const history = chrome.storage.local.data[STORAGE_KEYS.EXPORT_HISTORY];
      expect(history).toEqual([]);
    });

    it('should reject on chrome.storage error', async () => {
      chrome.storage.local.set.mockImplementationOnce((data, callback) => {
        chrome.runtime.lastError = { message: 'Set error' };
        callback();
        chrome.runtime.lastError = null;
      });

      await expect(ExportHistoryStorage.clear()).rejects.toThrow('Set error');
    });
  });

  describe('integration scenarios', () => {
    it('should support full save → get → clear cycle', async () => {
      // Save multiple exports
      await ExportHistoryStorage.save({
        method: 'pdf',
        metadata: { clientName: 'Client 1' }
      });

      await ExportHistoryStorage.save({
        method: 'clipboard',
        metadata: { clientName: 'Client 2' }
      });

      // Get all
      const all = await ExportHistoryStorage.getAll();
      expect(all).toHaveLength(2);

      // Filter by client
      const filtered = await ExportHistoryStorage.getByClient('Client 1');
      expect(filtered).toHaveLength(1);

      // Clear
      await ExportHistoryStorage.clear();
      const afterClear = await ExportHistoryStorage.getAll();
      expect(afterClear).toHaveLength(0);
    });

    it('should handle rapid consecutive saves', async () => {
      // Save sequentially to avoid race conditions
      for (let i = 0; i < 10; i++) {
        await ExportHistoryStorage.save({
          method: 'pdf',
          metadata: { clientName: `Client ${i}` }
        });
      }

      const history = await ExportHistoryStorage.getAll();
      expect(history).toHaveLength(10);
    });

    it('should maintain history after cleanup', async () => {
      // Populate 70 entries
      for (let i = 0; i < 70; i++) {
        await ExportHistoryStorage.save({
          method: 'pdf',
          metadata: { clientName: `Client ${i}` }
        });
      }

      // Clean oldest 20
      await ExportHistoryStorage.cleanOldest(20);

      const history = await ExportHistoryStorage.getAll();
      expect(history).toHaveLength(50);
      // Most recent should still be at the beginning
      expect(history[0].clientName).toBe('Client 69');
    });
  });
});
