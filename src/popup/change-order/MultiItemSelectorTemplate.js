/**
 * Multi-Item Selector Templates
 *
 * HTML template generation for the MultiItemSelector component.
 * Handles rendering of the selector container and individual detection items.
 *
 * @module MultiItemSelectorTemplate
 */

/**
 * Generate the HTML for the multi-item selector container.
 *
 * Renders the header, select/deselect controls, the list of detection items (via the provided renderer),
 * and a summary showing how many items are selected.
 *
 * @param {Array<Object>} detections - Array of detection objects to render as list items.
 * @param {Set<string>} selectedIds - Set of detection IDs that are currently selected.
 * @param {Function} renderDetectionItem - Function(detection, index) that returns HTML for a single item.
 * @returns {string} The HTML markup for the selector container.
 */
export function renderContainer(detections, selectedIds, renderDetectionItem) {
  return `
    <div class="multi-item-selector-header">
      <h3>Select Items to Include</h3>
      <p class="subtitle">Choose which scope creep detections to bundle in this change order</p>
    </div>

    <div class="multi-item-selector-controls">
      <button id="select-all-btn" class="btn btn-text">
        Select All (${detections.length})
      </button>
      <button id="deselect-all-btn" class="btn btn-text">
        Deselect All
      </button>
    </div>

    <div class="multi-item-selector-list">
      ${detections.map((detection, index) => renderDetectionItem(detection, index)).join('')}
    </div>

    <div class="multi-item-selector-summary">
      <span class="selection-count">
        <strong>${selectedIds.size}</strong> of ${detections.length} items selected
      </span>
    </div>
  `;
}

/**
 * Generate HTML for a single detection item, including a checkbox, sender, timestamp, and truncated text.
 *
 * The function applies sensible fallbacks for missing fields (id, sender, timestamp), truncates long text to 100 characters, marks the item as selected when its id is present in `selectedIds`, and escapes text content for safe HTML insertion.
 *
 * @param {Object} detection - Detection object. Expected fields used: `id`, `detectedText`, `sender` (may contain `name` or `email`), and `timestamp`.
 * @param {number} index - Index of the detection in the list; used to construct a fallback id when `detection.id` is absent.
 * @param {Set<string>} selectedIds - Set of selected detection IDs; if it contains the item's id the item is marked selected and its checkbox is checked.
 * @returns {string} HTML string representing the detection item.
 */
export function renderDetectionItem(detection, index, selectedIds) {
  const id = detection.id || `detection-${index}`;
  const isChecked = selectedIds.has(id);
  const text = detection.detectedText || 'No text available';
  const truncatedText = text.length > 100 ? text.substring(0, 100) + '...' : text;
  const sender = detection.sender?.name || detection.sender?.email || 'Unknown';
  const timestamp = detection.timestamp
    ? new Date(detection.timestamp).toLocaleString()
    : 'Unknown time';

  return `
    <div class="detection-item ${isChecked ? 'selected' : ''}">
      <label class="detection-checkbox-label">
        <input
          type="checkbox"
          class="detection-checkbox"
          data-detection-id="${id}"
          ${isChecked ? 'checked' : ''}
        />
        <div class="detection-content">
          <div class="detection-header">
            <span class="detection-sender">${escapeHtml(sender)}</span>
            <span class="detection-timestamp">${timestamp}</span>
          </div>
          <div class="detection-text">${escapeHtml(truncatedText)}</div>
        </div>
      </label>
    </div>
  `;
}

/**
 * Escape a string for safe insertion into HTML to prevent injection.
 *
 * @param {string} text - Value to escape; non-string inputs will be converted to string.
 * @returns {string} The input as an HTML-escaped string.
 */
export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}