/**
 * Export Controls Templates
 *
 * HTML template generation for the ExportControls component.
 * Provides the structure for export buttons and notifications.
 *
 * @module ExportControlsTemplate
 */

/**
 * Get export controls HTML structure
 *
 * @returns {string} HTML string for export controls
 */
export function getControlsHTML() {
  return `
    <div class="export-controls-content">
      <h3 class="export-title">Export Options</h3>

      <div class="export-buttons">
        <button id="export-pdf-btn" class="export-btn" disabled title="Export as PDF">
          <span class="btn-icon">📄</span>
          <span class="btn-text">Export PDF</span>
        </button>

        <button id="export-clipboard-btn" class="export-btn" disabled title="Copy to clipboard">
          <span class="btn-icon">📋</span>
          <span class="btn-text">Copy to Clipboard</span>
        </button>

        <button id="export-text-btn" class="export-btn" disabled title="Export as text file">
          <span class="btn-icon">📝</span>
          <span class="btn-text">Export Text</span>
        </button>
      </div>

      <div id="export-notification" class="export-notification" style="display: none;"></div>
    </div>
  `;
}
