/**
 * Selection State Manager
 *
 * Manages selection state for MultiItemSelector and synchronizes
 * the UI with the current selection.
 *
 * @module SelectionStateManager
 */

/**
 * Update UI to reflect current selection state
 *
 * @param {HTMLElement} container - Selector container element
 * @param {Set<string>} selectedIds - Set of selected detection IDs
 * @param {number} totalDetections - Total number of detections
 */
export function updateUI(container, selectedIds, totalDetections) {
  if (!container) return;

  // Update checkboxes
  const checkboxes = container.querySelectorAll('.detection-checkbox');
  checkboxes.forEach(checkbox => {
    const detectionId = checkbox.dataset.detectionId;
    checkbox.checked = selectedIds.has(detectionId);

    // Update parent detection-item styling
    const detectionItem = checkbox.closest('.detection-item');
    if (detectionItem) {
      if (checkbox.checked) {
        detectionItem.classList.add('selected');
      } else {
        detectionItem.classList.remove('selected');
      }
    }
  });

  // Update selection count
  const selectionCount = container.querySelector('.selection-count');
  if (selectionCount) {
    selectionCount.innerHTML = `
      <strong>${selectedIds.size}</strong> of ${totalDetections} items selected
    `;
  }
}

/**
 * Notify selection change callback
 *
 * @param {Function} callback - Callback function to invoke
 * @param {Array<Object>} detections - All detections
 * @param {Set<string>} selectedIds - Set of selected detection IDs
 */
export function notifySelectionChange(callback, detections, selectedIds) {
  if (callback && typeof callback === 'function') {
    const selectedDetections = getSelectedDetections(detections, selectedIds);
    callback(selectedDetections);
  }
}

/**
 * Get selected detection events
 *
 * @param {Array<Object>} detections - All detections
 * @param {Set<string>} selectedIds - Set of selected detection IDs
 * @returns {Array<Object>} Array of selected detections
 */
export function getSelectedDetections(detections, selectedIds) {
  return detections.filter(detection =>
    detection.id && selectedIds.has(detection.id)
  );
}
