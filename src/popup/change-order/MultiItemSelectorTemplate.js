/**
 * Multi-Item Selector Templates
 *
 * HTML template generation for the MultiItemSelector component.
 * Handles rendering of the selector container and individual detection items.
 *
 * @module MultiItemSelectorTemplate
 */

/**
 * Render main selector container HTML
 *
 * @param {Array<Object>} detections - Array of detection events
 * @param {Set<string>} selectedIds - Set of selected detection IDs
 * @param {Function} renderDetectionItem - Function to render individual items
 * @returns {string} HTML string for selector container
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
 * Render individual detection item HTML
 *
 * @param {Object} detection - Detection event
 * @param {number} index - Index in array
 * @param {Set<string>} selectedIds - Set of selected detection IDs
 * @returns {string} HTML string for detection item
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
 * Escape HTML to prevent XSS attacks
 *
 * @param {string} text - Text to escape
 * @returns {string} Escaped text safe for HTML insertion
 */
export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
