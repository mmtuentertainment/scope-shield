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

  /**
   * Maximum text length before truncation
   * @constant {number}
   * CodeRabbit: Extract magic number
   */
  static MAX_TEXT_LENGTH = 500;

  /**
   * Truncated text length
   * @constant {number}
   * CodeRabbit: Extract magic number
   */
  static TRUNCATED_TEXT_LENGTH = 200;

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
        // Phase 8 (T241-T244): Truncate long detected text (CodeRabbit: Guard text type + use constants)
        const rawText = typeof detection.text === 'string' ? detection.text : '(No text)';
        const shouldTruncate = rawText.length > ChangeOrderBuilder.MAX_TEXT_LENGTH;
        const truncated = shouldTruncate ? truncateText(rawText, ChangeOrderBuilder.TRUNCATED_TEXT_LENGTH) : rawText;

        // Phase 8 (T245-T249): Handle missing client name (CodeRabbit: Extract validation for DRY)
        const hasSender = typeof detection.sender === 'string' && detection.sender.trim() !== '';
        const senderName = hasSender ? detection.sender : 'Client';

        return {
          index: index + 1,
          sender: senderName,
          text: truncated,
          fullText: shouldTruncate ? rawText : null, // Store full text for expandable details
          trigger: detection.trigger || 'Unknown',
          date: this.formatDate(detection.date),
          missingClientName: !hasSender // CodeRabbit: Reuse validation
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
   * Get change order template (HTML format for inline editing)
   * Phase 9 refactor: HTML structure with data-field attributes
   * @private
   */
  getTemplate() {
    return `<div class="change-order-document">
  <header class="co-header">
    <h1>CHANGE ORDER REQUEST</h1>
    <div class="co-metadata">
      <p><strong>Generated:</strong> <span data-field="generatedDate">{{generatedDate}}</span></p>
      <p><strong>Freelancer:</strong> <span data-field="freelancerName">{{freelancerName}}</span></p>
    </div>
  </header>

  <section class="co-detections">
    <h2>SCOPE CREEP DETECTIONS ({{totalDetections}} items)</h2>
    <div class="detection-list">
      {{@each detections}}
      <div class="detection-item" data-detection-index="{{index}}"{{@if missingClientName}} data-missing-client="true"{{/@if}}>
        <p><strong>{{index}}. From:</strong> <span data-field="clientName-{{index}}"{{@if missingClientName}} class="requires-edit" style="background-color: #FFF9C4;" title="Please edit client name"{{/@if}}>{{sender}}</span></p>
        <p><strong>Date:</strong> {{date}}</p>
        <p><strong>Message:</strong> "{{text}}"{{@if fullText}} <button class="expand-details" data-full-text="{{fullText}}">Show More</button>{{/@if}}</p>
        <p><strong>Trigger Word:</strong> "{{trigger}}"</p>
      </div>
      {{/@each}}
    </div>
  </section>

  <section class="co-summary">
    <h2>SUMMARY</h2>
    <ul>
      <li><strong>Total Additional Work Detected:</strong> {{totalDetections}} items</li>
      <li><strong>Estimated Additional Hours:</strong> <span data-field="totalHours">{{totalHours}}</span> hours (at {{hoursPerDetection}} hours per item)</li>
      {{@if hasHourlyRate}}
      <li><strong>Your Hourly Rate:</strong> $<span data-field="hourlyRate">{{hourlyRate}}</span></li>
      <li><strong>Estimated Additional Cost:</strong> $<span data-field="costEstimate">{{totalCost}}</span></li>
      {{/@if}}
    </ul>
  </section>

  <section class="co-next-steps">
    <h2>NEXT STEPS</h2>
    <ol>
      <li>Review each item above for accuracy</li>
      <li>Adjust hour estimates if needed</li>
      <li>Send this change order to your client for approval</li>
      <li>Update your project scope and timeline accordingly</li>
    </ol>
  </section>

  <footer class="co-footer">
    <p><em>Generated by ScopeShield - Protecting Freelancers from Scope Creep</em></p>
  </footer>
</div>`;
  }
}
