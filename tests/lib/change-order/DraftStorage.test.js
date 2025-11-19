/**
 * DraftStorage Tests
 * Comprehensive test coverage for draft persistence functionality
 */
/* global chrome */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DraftStorage } from '../../../src/lib/change-order/DraftStorage.js';
import { STORAGE_KEYS } from '../../../src/lib/storage/StorageSchemas.js';

describe('DraftStorage', () => {
  beforeEach(() => {
    // Chrome storage is already mocked and reset in setup.js
    chrome.storage.local.data = {};
  });

  describe('save', () => {
    it('should save draft to chrome.storage.local', async () => {
      const draft = {
        changeOrderText: 'Test change order document',
        metadata: {
          clientName: 'Acme Corp',
          freelancerName: 'Jane Doe',
          date: '2025-11-19'
        },
        calculatorState: {
          hourlyRate: 150,
          estimatedHours: 8
        }
      };

      await DraftStorage.save(draft);

      const saved = chrome.storage.local.data[STORAGE_KEYS.DRAFT];
      expect(saved).toBeDefined();
      expect(saved.changeOrderText).toBe('Test change order document');
      expect(saved.metadata.clientName).toBe('Acme Corp');
      expect(saved.calculatorState.hourlyRate).toBe(150);
      expect(saved.savedAt).toBeDefined();
    });

    it('should add savedAt timestamp if not present', async () => {
      const draft = {
        changeOrderText: 'Test',
        metadata: { clientName: 'Test' },
        calculatorState: { hourlyRate: 100, estimatedHours: 5 }
      };

      await DraftStorage.save(draft);

      const saved = chrome.storage.local.data[STORAGE_KEYS.DRAFT];
      expect(saved.savedAt).toBeDefined();
      expect(new Date(saved.savedAt)).toBeInstanceOf(Date);
    });

    it('should preserve savedAt if already present', async () => {
      const customTimestamp = '2025-11-15T10:00:00Z';
      const draft = {
        changeOrderText: 'Test',
        metadata: { clientName: 'Test' },
        calculatorState: { hourlyRate: 100, estimatedHours: 5 },
        savedAt: customTimestamp
      };

      await DraftStorage.save(draft);

      const saved = chrome.storage.local.data[STORAGE_KEYS.DRAFT];
      expect(saved.savedAt).toBe(customTimestamp);
    });

    it('should reject invalid draft (missing changeOrderText)', async () => {
      const invalidDraft = {
        metadata: { clientName: 'Test' },
        calculatorState: { hourlyRate: 100, estimatedHours: 5 }
      };

      await expect(DraftStorage.save(invalidDraft)).rejects.toThrow('Invalid draft: missing required fields');
    });

    it('should reject empty draft', async () => {
      await expect(DraftStorage.save(null)).rejects.toThrow('Invalid draft');
      await expect(DraftStorage.save({})).rejects.toThrow('Invalid draft');
    });

    it('should reject draft with changeOrderText but missing metadata', async () => {
      const invalidDraft = {
        changeOrderText: 'Test change order',
        calculatorState: { hourlyRate: 100, estimatedHours: 5 }
        // Missing metadata
      };

      await expect(DraftStorage.save(invalidDraft)).rejects.toThrow('Invalid draft');
    });

    it('should reject draft with changeOrderText but missing calculatorState', async () => {
      const invalidDraft = {
        changeOrderText: 'Test change order',
        metadata: { clientName: 'Test Client' }
        // Missing calculatorState
      };

      await expect(DraftStorage.save(invalidDraft)).rejects.toThrow('Invalid draft');
    });

    it('should handle non-quota storage errors', async () => {
      const draft = {
        changeOrderText: 'Test',
        metadata: { clientName: 'Test' },
        calculatorState: { hourlyRate: 100, estimatedHours: 5 }
      };

      // Mock generic storage error (not quota)
      chrome.storage.local.set.mockImplementationOnce((data, callback) => {
        chrome.runtime.lastError = { message: 'Storage unavailable' };
        callback();
        chrome.runtime.lastError = null;
      });

      await expect(DraftStorage.save(draft)).rejects.toThrow('Storage unavailable');
    });

    it('should handle storage quota exceeded error', async () => {
      const draft = {
        changeOrderText: 'Test',
        metadata: { clientName: 'Test' },
        calculatorState: { hourlyRate: 100, estimatedHours: 5 }
      };

      // Mock quota exceeded error for this call only
      chrome.storage.local.set.mockImplementationOnce((data, callback) => {
        chrome.runtime.lastError = { message: 'QUOTA_BYTES quota exceeded' };
        callback();
        chrome.runtime.lastError = null;
      });

      await expect(DraftStorage.save(draft)).rejects.toThrow('Storage quota exceeded');
    });
  });

  describe('load', () => {
    it('should load saved draft from storage', async () => {
      const draft = {
        changeOrderText: 'Test change order',
        metadata: { clientName: 'Acme Corp' },
        calculatorState: { hourlyRate: 150, estimatedHours: 8 },
        savedAt: new Date().toISOString()
      };

      chrome.storage.local.data[STORAGE_KEYS.DRAFT] = draft;

      const loaded = await DraftStorage.load();

      expect(loaded).toEqual(draft);
      expect(loaded.changeOrderText).toBe('Test change order');
      expect(loaded.metadata.clientName).toBe('Acme Corp');
    });

    it('should return null if no draft exists', async () => {
      const loaded = await DraftStorage.load();
      expect(loaded).toBeNull();
    });

    it('should auto-delete draft older than 7 days', async () => {
      const oldDraft = {
        changeOrderText: 'Old draft',
        metadata: { clientName: 'Test' },
        calculatorState: { hourlyRate: 100, estimatedHours: 5 },
        savedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() // 8 days old
      };

      chrome.storage.local.data[STORAGE_KEYS.DRAFT] = oldDraft;

      const loaded = await DraftStorage.load();

      expect(loaded).toBeNull();
      expect(chrome.storage.local.data[STORAGE_KEYS.DRAFT]).toBeUndefined();
    });

    it('should load draft younger than 7 days', async () => {
      const recentDraft = {
        changeOrderText: 'Recent draft',
        metadata: { clientName: 'Test' },
        calculatorState: { hourlyRate: 100, estimatedHours: 5 },
        savedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days old
      };

      chrome.storage.local.data[STORAGE_KEYS.DRAFT] = recentDraft;

      const loaded = await DraftStorage.load();

      expect(loaded).not.toBeNull();
      expect(loaded.changeOrderText).toBe('Recent draft');
    });

    it('should delete and return null for corrupted draft (missing required fields)', async () => {
      const corruptedDraft = {
        changeOrderText: 'Test',
        // Missing metadata and calculatorState
        savedAt: new Date().toISOString()
      };

      chrome.storage.local.data[STORAGE_KEYS.DRAFT] = corruptedDraft;

      const loaded = await DraftStorage.load();

      expect(loaded).toBeNull();
      expect(chrome.storage.local.data[STORAGE_KEYS.DRAFT]).toBeUndefined();
    });

    it('should handle missing savedAt gracefully', async () => {
      const draftWithoutTimestamp = {
        changeOrderText: 'Test',
        metadata: { clientName: 'Test' },
        calculatorState: { hourlyRate: 100, estimatedHours: 5 }
        // No savedAt field
      };

      chrome.storage.local.data[STORAGE_KEYS.DRAFT] = draftWithoutTimestamp;

      const loaded = await DraftStorage.load();

      // Should still load if structure is valid
      expect(loaded).toEqual(draftWithoutTimestamp);
    });

    it('should return null on chrome.storage error (fail gracefully)', async () => {
      // Mock storage error for this call only
      chrome.storage.local.get.mockImplementationOnce((keys, callback) => {
        chrome.runtime.lastError = { message: 'Storage error' };
        callback({});
        chrome.runtime.lastError = null;
      });

      const loaded = await DraftStorage.load();

      expect(loaded).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete draft from storage', async () => {
      const draft = {
        changeOrderText: 'Test',
        metadata: { clientName: 'Test' },
        calculatorState: { hourlyRate: 100, estimatedHours: 5 },
        savedAt: new Date().toISOString()
      };

      chrome.storage.local.data[STORAGE_KEYS.DRAFT] = draft;

      await DraftStorage.delete();

      expect(chrome.storage.local.data[STORAGE_KEYS.DRAFT]).toBeUndefined();
    });

    it('should succeed even if no draft exists', async () => {
      // No draft in storage
      await expect(DraftStorage.delete()).resolves.toBeUndefined();
    });

    it('should reject on chrome.storage error', async () => {
      chrome.storage.local.remove.mockImplementationOnce((keys, callback) => {
        chrome.runtime.lastError = { message: 'Remove error' };
        callback();
        chrome.runtime.lastError = null;
      });

      await expect(DraftStorage.delete()).rejects.toThrow('Remove error');
    });
  });

  describe('hasDraft', () => {
    it('should return true if valid draft exists', async () => {
      const draft = {
        changeOrderText: 'Test',
        metadata: { clientName: 'Test' },
        calculatorState: { hourlyRate: 100, estimatedHours: 5 },
        savedAt: new Date().toISOString()
      };

      chrome.storage.local.data[STORAGE_KEYS.DRAFT] = draft;

      const result = await DraftStorage.hasDraft();

      expect(result).toBe(true);
    });

    it('should return false if no draft exists', async () => {
      const result = await DraftStorage.hasDraft();
      expect(result).toBe(false);
    });

    it('should return false if draft is expired (>7 days)', async () => {
      const oldDraft = {
        changeOrderText: 'Old draft',
        metadata: { clientName: 'Test' },
        calculatorState: { hourlyRate: 100, estimatedHours: 5 },
        savedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
      };

      chrome.storage.local.data[STORAGE_KEYS.DRAFT] = oldDraft;

      const result = await DraftStorage.hasDraft();

      expect(result).toBe(false);
    });

    it('should return false if draft is corrupted', async () => {
      const corruptedDraft = {
        changeOrderText: 'Test'
        // Missing required fields
      };

      chrome.storage.local.data[STORAGE_KEYS.DRAFT] = corruptedDraft;

      const result = await DraftStorage.hasDraft();

      expect(result).toBe(false);
    });

    it('should return false on error (fail gracefully)', async () => {
      // Mock error for this call only
      chrome.storage.local.get.mockImplementationOnce((keys, callback) => {
        chrome.runtime.lastError = { message: 'Error' };
        callback({});
        chrome.runtime.lastError = null;
      });

      const result = await DraftStorage.hasDraft();

      expect(result).toBe(false);
    });
  });

  describe('cleanOldDrafts', () => {
    it('should remove drafts older than specified age', async () => {
      const oldDraft = {
        changeOrderText: 'Old draft',
        metadata: { clientName: 'Test' },
        calculatorState: { hourlyRate: 100, estimatedHours: 5 },
        savedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() // 10 days old
      };

      chrome.storage.local.data[STORAGE_KEYS.DRAFT] = oldDraft;

      const cleaned = await DraftStorage.cleanOldDrafts(7 * 24 * 60 * 60 * 1000);

      expect(cleaned).toBe(true);
      expect(chrome.storage.local.data[STORAGE_KEYS.DRAFT]).toBeUndefined();
    });

    it('should not remove drafts younger than specified age', async () => {
      const recentDraft = {
        changeOrderText: 'Recent draft',
        metadata: { clientName: 'Test' },
        calculatorState: { hourlyRate: 100, estimatedHours: 5 },
        savedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days old
      };

      chrome.storage.local.data[STORAGE_KEYS.DRAFT] = recentDraft;

      const cleaned = await DraftStorage.cleanOldDrafts(7 * 24 * 60 * 60 * 1000);

      expect(cleaned).toBe(false);
      expect(chrome.storage.local.data[STORAGE_KEYS.DRAFT]).toEqual(recentDraft);
    });

    it('should return false if no draft exists', async () => {
      const cleaned = await DraftStorage.cleanOldDrafts();
      expect(cleaned).toBe(false);
    });

    it('should return false if draft has no savedAt', async () => {
      const draftWithoutTimestamp = {
        changeOrderText: 'Test',
        metadata: { clientName: 'Test' },
        calculatorState: { hourlyRate: 100, estimatedHours: 5 }
        // No savedAt
      };

      chrome.storage.local.data[STORAGE_KEYS.DRAFT] = draftWithoutTimestamp;

      const cleaned = await DraftStorage.cleanOldDrafts();

      expect(cleaned).toBe(false);
    });

    it('should return false on error (fail gracefully)', async () => {
      chrome.storage.local.get.mockImplementationOnce((keys, callback) => {
        chrome.runtime.lastError = { message: 'Error' };
        callback({});
        chrome.runtime.lastError = null;
      });

      const cleaned = await DraftStorage.cleanOldDrafts();

      expect(cleaned).toBe(false);
    });
  });

  describe('integration scenarios', () => {
    it('should support full save → load → delete cycle', async () => {
      const draft = {
        changeOrderText: 'Integration test',
        metadata: { clientName: 'Test Corp' },
        calculatorState: { hourlyRate: 200, estimatedHours: 10 }
      };

      // Save
      await DraftStorage.save(draft);
      expect(await DraftStorage.hasDraft()).toBe(true);

      // Load
      const loaded = await DraftStorage.load();
      expect(loaded.changeOrderText).toBe('Integration test');

      // Delete
      await DraftStorage.delete();
      expect(await DraftStorage.hasDraft()).toBe(false);
    });

    it('should handle concurrent saves (last write wins)', async () => {
      const draft1 = {
        changeOrderText: 'Draft 1',
        metadata: { clientName: 'Client 1' },
        calculatorState: { hourlyRate: 100, estimatedHours: 5 }
      };

      const draft2 = {
        changeOrderText: 'Draft 2',
        metadata: { clientName: 'Client 2' },
        calculatorState: { hourlyRate: 150, estimatedHours: 8 }
      };

      await DraftStorage.save(draft1);
      await DraftStorage.save(draft2);

      const loaded = await DraftStorage.load();
      expect(loaded.changeOrderText).toBe('Draft 2');
    });
  });
});
