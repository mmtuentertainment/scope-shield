/**
 * Export Controls Templates
 *
 * HTML template generation for the ExportControls component.
 * Provides the structure for export buttons and notifications.
 *
 * @module ExportControlsTemplate
 */

/**
 * Generate HTML markup for the export controls UI.
 *
 * The markup includes a container with a title ("Export Options"), three initially disabled export buttons
 * (Export PDF, Copy to Clipboard, Export Text) each with an icon and label, and a hidden notification element
 * with id "export-notification".
 *
 * @returns {string} The HTML string representing the export controls.
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