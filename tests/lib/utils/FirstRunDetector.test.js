// T061: FirstRunDetector tests
/* global chrome */

import { describe, it, expect, beforeEach } from 'vitest';
import { FirstRunDetector } from '../../../src/lib/utils/FirstRunDetector.js';
import { SettingsStorage } from '../../../src/lib/storage/SettingsStorage.js';
import { FreelancerSettings } from '../../../src/lib/storage/FreelancerSettings.js';

describe('FirstRunDetector', () => {
  beforeEach(() => {
    // Chrome storage is already mocked and reset in setup.js
  });

  describe('isFirstRun', () => {
    it('should return true when freelancerName is empty', async () => {
      // Storage has default settings with empty name
      const isFirst = await FirstRunDetector.isFirstRun();

      expect(isFirst).toBe(true);
    });

    it('should return true when freelancerName is whitespace-only', async () => {
      const settings = new FreelancerSettings({
        freelancerName: '   ',
        hourlyRate: 100,
        defaultExportMethod: 'pdf'
      });
      await SettingsStorage.save(settings);

      const isFirst = await FirstRunDetector.isFirstRun();

      expect(isFirst).toBe(true);
    });

    it('should return false when freelancerName is set', async () => {
      const settings = new FreelancerSettings({
        freelancerName: 'Jane Doe',
        hourlyRate: 150,
        defaultExportMethod: 'pdf'
      });
      await SettingsStorage.save(settings);

      const isFirst = await FirstRunDetector.isFirstRun();

      expect(isFirst).toBe(false);
    });
  });

  describe('completeFirstRun', () => {
    it('should save freelancerName to settings', async () => {
      await FirstRunDetector.completeFirstRun('John Smith');

      const settings = await SettingsStorage.get();
      expect(settings.freelancerName).toBe('John Smith');
    });

    it('should preserve other settings when completing first run', async () => {
      // Set some initial settings
      const initialSettings = new FreelancerSettings({
        freelancerName: '',
        hourlyRate: 200,
        defaultExportMethod: 'clipboard',
        autoExportEnabled: false
      });
      await SettingsStorage.save(initialSettings);

      // Complete first run
      await FirstRunDetector.completeFirstRun('Jane Doe');

      // Verify name is saved and other settings preserved
      const settings = await SettingsStorage.get();
      expect(settings.freelancerName).toBe('Jane Doe');
      expect(settings.hourlyRate).toBe(200);
      expect(settings.defaultExportMethod).toBe('clipboard');
      expect(settings.autoExportEnabled).toBe(false);
    });

    it('should throw error if saving fails', async () => {
      // Force an error by making chrome.storage.local.set fail
      chrome.storage.local.set = vi.fn((items, callback) => {
        chrome.runtime.lastError = { message: 'Storage quota exceeded' };
        callback();
        chrome.runtime.lastError = null;
      });

      await expect(FirstRunDetector.completeFirstRun('Test User'))
        .rejects.toThrow('Storage quota exceeded');
    });
  });
});
