// T019: Storage schema version constants and migration helpers

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
  changeOrdersForClient: (clientEmail) =>
    `scopeshield_changeorders_${clientEmail}_v1`,

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
 * Migrate stored data from one schema version to another.
 * Currently a no-op that returns the input unchanged; future versions will perform transformations when migrating between schema versions.
 * @param {string} fromVersion - Source schema version identifier.
 * @param {string} toVersion - Target schema version identifier.
 * @param {object} data - The data object to migrate.
 * @returns {object} The migrated data object (or the original `data` when no migration is performed).
 */
export function migrateSchema(fromVersion, toVersion, data) {
  // MVP: No migrations needed yet (all v1)
  // Phase 2: Add migration logic when introducing v2 schemas
  return data;
}

/**
 * Check whether a stored schema version matches the expected schema version.
 * @param {string} currentVersion - Schema version read from storage.
 * @param {string} expectedVersion - Schema version expected by the code.
 * @returns {boolean} `true` if the versions match, `false` otherwise.
 */
export function isSchemaCompatible(currentVersion, expectedVersion) {
  return currentVersion === expectedVersion;
}