// T033: Storage schemas tests

import { describe, it, expect } from 'vitest';
import { SCHEMA_VERSIONS, STORAGE_KEYS, DEFAULTS, isSchemaCompatible } from '../../../src/lib/storage/StorageSchemas.js';

describe('StorageSchemas', () => {
  describe('SCHEMA_VERSIONS', () => {
    it('should define all schema versions', () => {
      expect(SCHEMA_VERSIONS.SETTINGS).toBe('v1');
      expect(SCHEMA_VERSIONS.CHANGE_ORDERS).toBe('v1');
      expect(SCHEMA_VERSIONS.DRAFT).toBe('v1');
      expect(SCHEMA_VERSIONS.EXPORT_HISTORY).toBe('v1');
    });
  });

  describe('STORAGE_KEYS', () => {
    it('should define settings key', () => {
      expect(STORAGE_KEYS.SETTINGS).toBe('scopeshield_settings_v1');
    });

    it('should generate change order keys per client', () => {
      const key1 = STORAGE_KEYS.changeOrdersForClient('client@example.com');
      const key2 = STORAGE_KEYS.changeOrdersForClient('other@example.com');

      expect(key1).toBe('scopeshield_changeorders_client_example_com_v1');
      expect(key2).toBe('scopeshield_changeorders_other_example_com_v1');
      expect(key1).not.toBe(key2);
    });

    it('should normalize client email in changeOrdersForClient key', () => {
      const key1 = STORAGE_KEYS.changeOrdersForClient('John@Example.com');
      const key2 = STORAGE_KEYS.changeOrdersForClient('john@example.com');
      const key3 = STORAGE_KEYS.changeOrdersForClient('john+test@example.com');
      const key4 = STORAGE_KEYS.changeOrdersForClient('  JOHN@EXAMPLE.COM  ');

      // All variations of same base email should normalize to same key
      expect(key1).toBe('scopeshield_changeorders_john_example_com_v1');
      expect(key2).toBe('scopeshield_changeorders_john_example_com_v1');
      expect(key1).toBe(key2); // Case-insensitive
      expect(key4).toBe(key2); // Whitespace trimmed

      // Email with + should be different (plus sign replaced with underscore)
      expect(key3).toBe('scopeshield_changeorders_john_test_example_com_v1');
      expect(key3).not.toBe(key1);
    });

    it('should define draft key', () => {
      expect(STORAGE_KEYS.DRAFT).toBe('scopeshield_draft_changeorder_v1');
    });
  });

  describe('DEFAULTS', () => {
    it('should provide default settings', () => {
      expect(DEFAULTS.settings).toHaveProperty('freelancerName', '');
      expect(DEFAULTS.settings).toHaveProperty('hourlyRate', 0);
      expect(DEFAULTS.settings).toHaveProperty('defaultExportMethod', 'pdf');
      expect(DEFAULTS.settings).toHaveProperty('autoExportEnabled', true);
      expect(DEFAULTS.settings).toHaveProperty('autoExportDelay', 3);
    });

    it('should provide default change order', () => {
      expect(DEFAULTS.changeOrder).toHaveProperty('changeOrderNumber', '001');
      expect(DEFAULTS.changeOrder).toHaveProperty('costEstimate', '$XXX');
      expect(DEFAULTS.changeOrder).toHaveProperty('paymentTerms', 'Net 30');
      expect(DEFAULTS.changeOrder).toHaveProperty('status', 'draft');
      expect(DEFAULTS.changeOrder.requestedChanges).toEqual([]);
    });
  });

  describe('isSchemaCompatible', () => {
    it('should return true for matching versions', () => {
      expect(isSchemaCompatible('v1', 'v1')).toBe(true);
    });

    it('should return false for mismatched versions', () => {
      expect(isSchemaCompatible('v1', 'v2')).toBe(false);
    });
  });
});
