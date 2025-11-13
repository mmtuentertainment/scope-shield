// T041-T044: SettingsStorage tests

import { describe, it, expect, beforeEach } from 'vitest';
import { SettingsStorage } from '../../../src/lib/storage/SettingsStorage.js';
import { FreelancerSettings } from '../../../src/lib/storage/FreelancerSettings.js';
import { STORAGE_KEYS } from '../../../src/lib/storage/StorageSchemas.js';

describe('SettingsStorage', () => {
  beforeEach(() => {
    // Chrome storage is already mocked and reset in setup.js
  });

  describe('get', () => {
    it('should load settings from chrome.storage.local', async () => {
      // Pre-populate storage
      const testSettings = {
        freelancerName: 'Jane Doe',
        hourlyRate: 150,
        defaultExportMethod: 'pdf',
        autoExportEnabled: true,
        autoExportDelay: 3,
        lastUpdated: '2025-11-12T10:00:00Z'
      };

      chrome.storage.local.data[STORAGE_KEYS.SETTINGS] = testSettings;

      const settings = await SettingsStorage.get();

      expect(settings).toBeInstanceOf(FreelancerSettings);
      expect(settings.freelancerName).toBe('Jane Doe');
      expect(settings.hourlyRate).toBe(150);
      expect(settings.defaultExportMethod).toBe('pdf');
    });

    it('should return defaults when no settings exist (T042)', async () => {
      // Storage is empty
      const settings = await SettingsStorage.get();

      expect(settings).toBeInstanceOf(FreelancerSettings);
      expect(settings.freelancerName).toBe('');
      expect(settings.hourlyRate).toBe(0);
      expect(settings.defaultExportMethod).toBe('pdf');
      expect(settings.autoExportEnabled).toBe(true);
      expect(settings.autoExportDelay).toBe(3);
    });
  });

  describe('save', () => {
    it('should save valid settings to chrome.storage.local', async () => {
      const settings = new FreelancerSettings({
        freelancerName: 'John Smith',
        hourlyRate: 200,
        defaultExportMethod: 'clipboard',
        autoExportEnabled: false,
        autoExportDelay: 5
      });

      await SettingsStorage.save(settings);

      // Verify saved to chrome.storage.local
      expect(chrome.storage.local.set).toHaveBeenCalled();
      expect(chrome.storage.local.data[STORAGE_KEYS.SETTINGS]).toBeDefined();
      expect(chrome.storage.local.data[STORAGE_KEYS.SETTINGS].freelancerName).toBe('John Smith');
    });

    it('should reject invalid settings (T043)', async () => {
      const invalidSettings = new FreelancerSettings({
        freelancerName: 'Test',
        hourlyRate: -10, // Invalid: must be >= 0
        defaultExportMethod: 'pdf'
      });

      await expect(SettingsStorage.save(invalidSettings)).rejects.toThrow();
    });

    it('should validate hourly rate > 0 if provided (T044)', async () => {
      const settings = new FreelancerSettings({
        freelancerName: 'Test User',
        hourlyRate: 0, // Valid: 0 is allowed (optional field)
        defaultExportMethod: 'pdf'
      });

      await expect(SettingsStorage.save(settings)).resolves.toBeUndefined();

      const negativeSettings = new FreelancerSettings({
        freelancerName: 'Test User',
        hourlyRate: -50, // Invalid: must be >= 0
        defaultExportMethod: 'pdf'
      });

      await expect(SettingsStorage.save(negativeSettings)).rejects.toThrow('must be greater than or equal to 0');
    });
  });

  describe('getDefaults', () => {
    it('should return default settings', () => {
      const defaults = SettingsStorage.getDefaults();

      expect(defaults).toBeInstanceOf(FreelancerSettings);
      expect(defaults.freelancerName).toBe('');
      expect(defaults.hourlyRate).toBe(0);
      expect(defaults.defaultExportMethod).toBe('pdf');
      expect(defaults.autoExportEnabled).toBe(true);
      expect(defaults.autoExportDelay).toBe(3);
    });
  });

  describe('validate', () => {
    it('should validate settings without saving', () => {
      const validSettings = new FreelancerSettings({
        freelancerName: 'Valid User',
        hourlyRate: 100,
        defaultExportMethod: 'pdf'
      });

      const result = SettingsStorage.validate(validSettings);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors for invalid settings', () => {
      const invalidSettings = new FreelancerSettings({
        freelancerName: 'Test',
        hourlyRate: 20000, // Exceeds max $10,000
        defaultExportMethod: 'invalid-method'
      });

      const result = SettingsStorage.validate(invalidSettings);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('clear', () => {
    it('should clear settings from storage', async () => {
      // Pre-populate storage
      chrome.storage.local.data[STORAGE_KEYS.SETTINGS] = {
        freelancerName: 'Test'
      };

      await SettingsStorage.clear();

      expect(chrome.storage.local.data[STORAGE_KEYS.SETTINGS]).toBeUndefined();
    });
  });
});
