import { TemplateEngine } from './TemplateEngine.js';
import { FreelancerSettings } from '../storage/FreelancerSettings.js';
import { logWarning, logError } from '../utils/Logger.js';
import { truncateText } from '../utils/Sanitizer.js'; // Phase 8 (T241-T244)

/**
 * Builds professional change order documents from scope creep detections
 *
 * Features:
 * - Estimates hours (2h per detection heuristic)
 * - Calculates costs if hourly rate available
 * - Generates formatted document using TemplateEngine
 *
 * Performance:
 * - <5s for 50 detections (Constitution Principle III)
 */
export class ChangeOrderBuilder {
  /**
   * Default hours estimated per detection
   * @constant {number}
   */
  static HOURS_PER_DETECTION = 2;

  constructor() {
    this.engine = new TemplateEngine();
  }

  /**
   * Get current date (can be overridden for testing)
   * @returns {Date} Current date
   * @protected
   */
  getCurrentDate() {
    return new Date();
  }

  /**
   * Build a change order document from detections
   * @param {Array} detections - Array of scope creep detections
   * @param {Object} settings - Optional freelancer settings (will load defaults if not provided)
   * @returns {Promise<string>} Formatted change order document
   * @throws {Error} If detections is invalid or settings is not an object
   */
  async build(detections, settings = null) {
    // Validate input
    if (detections === null || detections === undefined) {
      throw new Error('Detections array is required');
    }
    if (!Array.isArray(detections)) {
      throw new Error('Detections must be an array');
    }
    if (settings !== null && (typeof settings !== 'object' || Array.isArray(settings))) {
      throw new Error('Settings must be an object or null');
    }

    // Load settings if not provided
    const freelancerSettings = settings || await FreelancerSettings.load();

    // Handle empty detections
    if (detections.length === 0) {
      return this.buildEmptyChangeOrder(freelancerSettings);
    }

    // Prepare data for template
    const templateData = this.prepareTemplateData(detections, freelancerSettings);

    // Render using template engine
    const template = this.getTemplate();
    return this.engine.render(template, templateData);
  }

  /**
   * Prepare data object for template rendering
   * @private
   * @param {Array} detections - Array of detections
   * @param {Object} settings - Freelancer settings
   * @returns {Object} Template data
   */
  prepareTemplateData(detections, settings) {
    const totalHours = this.estimateHours(detections);

    // Normalize hourly rate to number
    const hourlyRate = Number(settings.hourlyRate) || 0;
    const hasHourlyRate = hourlyRate > 0;

    // Calculate and format cost to 2 decimal places
    const totalCost = hasHourlyRate ? this.calculateCost(totalHours, hourlyRate).toFixed(2) : null;

    return {
      generatedDate: this.getCurrentDate().toISOString().split('T')[0],
      freelancerName: settings.freelancerName || 'Freelancer',
      hoursPerDetection: ChangeOrderBuilder.HOURS_PER_DETECTION,
      detections: detections.map((detection, index) => {
        // Phase 8 (T241-T244): Truncate long detected text
        const rawText = detection.text || '(No text)';
        const truncated = rawText.length > 500 ? truncateText(rawText, 200) : rawText;

        // Phase 8 (T245-T249): Handle missing client name
        const senderName = detection.sender && detection.sender.trim() !== '' ? detection.sender : 'Client';

        return {
          index: index + 1,
          sender: senderName,
          text: truncated,
          fullText: rawText.length > 500 ? rawText : null, // Store full text for expandable details
          trigger: detection.trigger || 'Unknown',
          date: this.formatDate(detection.date),
          missingClientName: !detection.sender || detection.sender.trim() === '' // Flag for UI highlighting
        };
      }),
      totalDetections: detections.length,
      totalHours,
      hasHourlyRate,
      hourlyRate,
      totalCost
    };
  }

  /**
   * Estimate hours for detections using simple heuristic
   * @param {Array} detections - Array of detections
   * @returns {number} Estimated hours (HOURS_PER_DETECTION per detection)
   */
  estimateHours(detections) {
    return detections.length * ChangeOrderBuilder.HOURS_PER_DETECTION;
  }

  /**
   * Calculate cost from hours and hourly rate
   * @param {number} hours - Number of hours
   * @param {number} rate - Hourly rate
   * @returns {number} Total cost
   */
  calculateCost(hours, rate) {
    if (!hours || !rate) {
      return 0;
    }
    return hours * rate;
  }

  /**
   * Format date string to readable format
   * @param {string} dateString - ISO date string or date
   * @returns {string} Formatted date (YYYY-MM-DD)
   */
  formatDate(dateString) {
    if (!dateString) {
      return 'Unknown';
    }

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        logWarning('Invalid date format:', dateString);
        return dateString; // Return as-is if invalid
      }
      return date.toISOString().split('T')[0];
    } catch (error) {
      logError('Error formatting date:', `${dateString} - ${error.message}`);
      return dateString;
    }
  }

  /**
   * Build empty change order when no detections
   * @private
   * @param {Object} settings - Freelancer settings
   * @returns {string} Empty change order message
   */
  buildEmptyChangeOrder(settings) {
    return `CHANGE ORDER REQUEST

Generated: ${this.getCurrentDate().toISOString().split('T')[0]}
Freelancer: ${settings.freelancerName || 'Freelancer'}

No scope creep detected.

This document can be generated when scope creep is detected.`;
  }

  /**
   * Get change order template
   * @private
   */
  getTemplate() {
    return `CHANGE ORDER REQUEST

Generated: {{generatedDate}}
Freelancer: {{freelancerName}}

SCOPE CREEP DETECTIONS ({{totalDetections}} items):

{{@each detections}}{{index}}. From: {{sender}}
   Date: {{date}}
   Message: "{{text}}"
   Trigger Word: "{{trigger}}"

{{/@each}}

SUMMARY:
- Total Additional Work Detected: {{totalDetections}} items
- Estimated Additional Hours: {{totalHours}} hours (at {{hoursPerDetection}} hours per item)
{{@if hasHourlyRate}}- Your Hourly Rate: \${{hourlyRate}}
- Estimated Additional Cost: \${{totalCost}}
{{/@if}}

NEXT STEPS:
1. Review each item above for accuracy
2. Adjust hour estimates if needed
3. Send this change order to your client for approval
4. Update your project scope and timeline accordingly

---
Generated by ScopeShield - Protecting Freelancers from Scope Creep`;
  }
}
