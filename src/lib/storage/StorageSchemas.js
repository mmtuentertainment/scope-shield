// T019: Storage schema version constants and migration helpers

import { sanitizeEmail } from '../utils/Sanitizer.js';

/**
 * Storage schema versions for change order feature
 */
export const SCHEMA_VERSIONS = {
  SETTINGS: 'v1',
  CHANGE_ORDERS: 'v1',
  DRAFT: 'v1',
  EXPORT_HISTORY: 'v1'
};

/**
 * Storage key generators with version suffixes
 */
export const STORAGE_KEYS = {
  // Settings (singleton)
  SETTINGS: 'scopeshield_settings_v1',

  // Change orders by client (array per client)
  changeOrdersForClient: (clientEmail) => {
    // Normalize: lowercase, trim, replace special chars for consistent keys
    const normalized = sanitizeEmail(clientEmail).replace(/[@.+]/g, '_');
    return `scopeshield_changeorders_${normalized}_v1`;
  },

  // Draft change order (temporary)
  DRAFT: 'scopeshield_draft_changeorder_v1',

  // Export history
  EXPORT_HISTORY: 'scopeshield_export_history_v1'
};

/**
 * Default values for entities
 */
export const DEFAULTS = {
  settings: {
    freelancerName: '',
    hourlyRate: 0,
    defaultExportMethod: 'pdf',
    autoExportEnabled: true,
    autoExportDelay: 3,
    lastUpdated: null
  },

  changeOrder: {
    id: null,
    changeOrderNumber: '001',
    clientName: '',
    clientEmail: '',
    freelancerName: '',
    dateCreated: null,
    originalScope: '',
    requestedChanges: [],
    costEstimate: '$XXX',
    revisedTimeline: '',
    paymentTerms: 'Net 30',
    additionalNotes: '',
    status: 'draft',
    exportedAt: null,
    exportFormat: null
  }
};

/**
 * Schema migration helper (for future versions)
 * @param {string} fromVersion - Current version
 * @param {string} toVersion - Target version
 * @param {object} data - Data to migrate
 * @returns {object} Migrated data
 */
export function migrateSchema(fromVersion, toVersion, data) {
  // MVP: No migrations needed yet (all v1)
  // Phase 2: Add migration logic when introducing v2 schemas
  return data;
}

/**
 * Validate schema version compatibility
 * @param {string} currentVersion - Schema version from storage
 * @param {string} expectedVersion - Expected schema version
 * @returns {boolean} True if compatible
 */
export function isSchemaCompatible(currentVersion, expectedVersion) {
  return currentVersion === expectedVersion;
}
