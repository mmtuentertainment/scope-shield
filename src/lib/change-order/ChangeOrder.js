// T025-T028: ChangeOrder entity class with validation

import { generateUUID } from '../utils/UUIDGenerator.js';
import { getCurrentDateTimeISO } from '../utils/DateFormatter.js';
import { DEFAULTS } from '../storage/StorageSchemas.js';

// Valid values for change order status and export format
const VALID_STATUSES = ['draft', 'generated', 'exported'];
const VALID_EXPORT_FORMATS = ['pdf', 'text', 'clipboard'];

/**
 * ChangeOrder entity class
 * Represents a generated change order document
 */
export class ChangeOrder {
  constructor(data = {}) {
    // Merge with defaults
    const merged = { ...DEFAULTS.changeOrder, ...data };

    this.id = merged.id || generateUUID();
    this.changeOrderNumber = merged.changeOrderNumber;
    this.clientName = merged.clientName;
    this.clientEmail = merged.clientEmail;
    this.freelancerName = merged.freelancerName;
    this.dateCreated = merged.dateCreated || getCurrentDateTimeISO();
    this.originalScope = merged.originalScope;
    this.requestedChanges = Array.isArray(merged.requestedChanges)
      ? [...merged.requestedChanges]
      : [];
    this.costEstimate = merged.costEstimate;
    this.revisedTimeline = merged.revisedTimeline;
    this.paymentTerms = merged.paymentTerms;
    this.additionalNotes = merged.additionalNotes;
    this.status = merged.status;
    this.exportedAt = merged.exportedAt;
    this.exportFormat = merged.exportFormat;
  }

  /**
   * T026: Validate change order has required fields
   * @returns {{valid: boolean, errors: string[]}}
   */
  validate() {
    const errors = [];

    this.validateRequiredFields(errors);
    this.validateStatus(errors);
    this.validateExportFields(errors);

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate required fields
   * @private
   */
  validateRequiredFields(errors) {
    if (!this.id) errors.push('ID is required');
    if (!this.changeOrderNumber) errors.push('Change order number is required');
    if (!this.clientName || this.clientName.trim() === '') errors.push('Client name is required');
    if (!this.clientEmail || this.clientEmail.trim() === '') errors.push('Client email is required');
    if (!this.freelancerName || this.freelancerName.trim() === '') errors.push('Freelancer name is required');
    if (!this.dateCreated) errors.push('Date created is required');
  }

  /**
   * Validate status field
   * @private
   */
  validateStatus(errors) {
    if (!VALID_STATUSES.includes(this.status)) {
      errors.push(`Status must be one of: ${VALID_STATUSES.join(', ')}`);
    }
  }

  /**
   * Validate export-related fields
   * @private
   */
  validateExportFields(errors) {
    if (this.status === 'exported') {
      if (!this.exportFormat || !VALID_EXPORT_FORMATS.includes(this.exportFormat)) {
        errors.push('Export format required when status is "exported"');
      }
      if (!this.exportedAt) {
        errors.push('Export timestamp required when status is "exported"');
      }
    }
  }

  /**
   * T027: Serialize to JSON for storage
   * @returns {object} Plain object representation
   */
  toJSON() {
    return {
      id: this.id,
      changeOrderNumber: this.changeOrderNumber,
      clientName: this.clientName,
      clientEmail: this.clientEmail,
      freelancerName: this.freelancerName,
      dateCreated: this.dateCreated,
      originalScope: this.originalScope,
      requestedChanges: this.requestedChanges,
      costEstimate: this.costEstimate,
      revisedTimeline: this.revisedTimeline,
      paymentTerms: this.paymentTerms,
      additionalNotes: this.additionalNotes,
      status: this.status,
      exportedAt: this.exportedAt,
      exportFormat: this.exportFormat
    };
  }

  /**
   * T028: Deserialize from JSON storage
   * @param {object} json - Plain object from storage
   * @returns {ChangeOrder} ChangeOrder instance
   */
  static fromJSON(json) {
    return new ChangeOrder(json);
  }

  /**
   * Mark change order as exported
   * @param {string} format - Export format ('pdf', 'text', 'clipboard')
   */
  markAsExported(format) {
    if (!VALID_EXPORT_FORMATS.includes(format)) {
      throw new Error(
        `Invalid export format: ${format}. Must be one of: ${VALID_EXPORT_FORMATS.join(', ')}`
      );
    }

    this.status = 'exported';
    this.exportFormat = format;
    this.exportedAt = getCurrentDateTimeISO();
  }

  /**
   * Check if change order is exportable
   * @returns {boolean} True if can be exported
   */
  canExport() {
    const validation = this.validate();
    return validation.valid && this.status !== 'draft';
  }
}
