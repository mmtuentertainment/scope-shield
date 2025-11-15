// T029-T031: FreelancerSettings entity class

import { getCurrentDateTimeISO } from '../utils/DateFormatter.js';
import { DEFAULTS } from './StorageSchemas.js';

/**
 * FreelancerSettings entity class
 * Stores user preferences
 */
export class FreelancerSettings {
  constructor(data = {}) {
    // Merge with defaults
    const merged = { ...DEFAULTS.settings, ...data };

    this.freelancerName = merged.freelancerName;
    this.hourlyRate = merged.hourlyRate;
    this.defaultExportMethod = merged.defaultExportMethod;
    this.autoExportEnabled = merged.autoExportEnabled;
    this.autoExportDelay = merged.autoExportDelay;
    this.lastUpdated = merged.lastUpdated || getCurrentDateTimeISO();
  }

  /**
   * T030: Validate settings
   * @returns {{valid: boolean, errors: string[]}}
   */
  validate() {
    const errors = [];

    this.validateFreelancerName(errors);
    this.validateHourlyRate(errors);
    this.validateExportSettings(errors);

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate freelancer name
   * @private
   */
  validateFreelancerName(errors) {
    if (typeof this.freelancerName !== 'string') {
      errors.push('Freelancer name must be a string');
    }
  }

  /**
   * Validate hourly rate
   * @private
   */
  validateHourlyRate(errors) {
    if (this.hourlyRate !== null && this.hourlyRate !== undefined) {
      const rate = parseFloat(this.hourlyRate);
      if (isNaN(rate)) {
        errors.push('Hourly rate must be a valid number');
      } else if (rate < 0) {
        errors.push('Hourly rate must be greater than or equal to 0');
      } else if (rate > 10000) {
        errors.push('Hourly rate must be less than or equal to $10,000');
      }
    }
  }

  /**
   * Validate export settings
   * @private
   */
  validateExportSettings(errors) {
    const validExportMethods = ['clipboard', 'pdf', 'text'];
    if (!validExportMethods.includes(this.defaultExportMethod)) {
      errors.push(`Default export method must be one of: ${validExportMethods.join(', ')}`);
    }

    if (typeof this.autoExportEnabled !== 'boolean') {
      errors.push('Auto-export enabled must be a boolean');
    }

    if (this.autoExportDelay !== null && this.autoExportDelay !== undefined) {
      const delay = parseFloat(this.autoExportDelay);
      if (isNaN(delay)) {
        errors.push('Auto-export delay must be a valid number');
      } else if (delay < 1) {
        errors.push('Auto-export delay must be at least 1 second');
      } else if (delay > 10) {
        errors.push('Auto-export delay must be at most 10 seconds');
      }
    }
  }

  /**
   * T031: Get default settings for first-run
   * @returns {FreelancerSettings} Settings instance with defaults
   */
  static getDefaults() {
    return new FreelancerSettings(DEFAULTS.settings);
  }

  /**
   * Serialize to JSON for storage
   * @returns {object} Plain object representation
   */
  toJSON() {
    return {
      freelancerName: this.freelancerName,
      hourlyRate: this.hourlyRate,
      defaultExportMethod: this.defaultExportMethod,
      autoExportEnabled: this.autoExportEnabled,
      autoExportDelay: this.autoExportDelay,
      lastUpdated: this.lastUpdated
    };
  }

  /**
   * Deserialize from JSON storage
   * @param {object} json - Plain object from storage
   * @returns {FreelancerSettings} Settings instance
   */
  static fromJSON(json) {
    return new FreelancerSettings(json);
  }

  /**
   * Check if first-run (freelancer name not set)
   * @returns {boolean} True if first-run
   */
  isFirstRun() {
    return !this.freelancerName || this.freelancerName.trim() === '';
  }

  /**
   * Update settings and refresh timestamp
   *
   * NOTE: This method does NOT validate updates. Caller MUST call validate()
   * after updating and before calling SettingsStorage.save().
   *
   * @param {object} updates - Partial settings to update
   * @example
   * settings.update({ freelancerName: 'New Name' });
   * settings.validate();  // Required before save
   * await SettingsStorage.save(settings);
   */
  update(updates) {
    Object.assign(this, updates);
    this.lastUpdated = getCurrentDateTimeISO();
  }
}
