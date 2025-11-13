/**
 * Selection State Manager
 *
 * Manages selection state for MultiItemSelector and synchronizes
 * the UI with the current selection.
 *
 * @module SelectionStateManager
 */

/**
 * Synchronize the DOM inside a container to reflect the current selection state.
 *
 * If `container` is falsy, the function returns without making changes. For each
 * element with class `detection-checkbox` it sets the checkbox state based on
 * `selectedIds` and adds/removes the `selected` class on the nearest
 * `.detection-item` ancestor. It also updates the `.selection-count` element
 * (if present) to show the number of selected items against `totalDetections`.
 *
 * @param {HTMLElement} container - Container element that holds detection items and controls.
 * @param {Set<string>} selectedIds - Set of selected detection IDs.
 * @param {number} totalDetections - Total number of detection items to display in the count.
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
 * Invoke the provided callback with the subset of detections whose ids are contained in `selectedIds`.
 *
 * @param {Function} callback - Function to call with the selected detections; ignored if not a function.
 * @param {Array<Object>} detections - Array of detection objects (each expected to have an `id` property).
 * @param {Set<string>} selectedIds - Set of selected detection IDs.
 */
export function notifySelectionChange(callback, detections, selectedIds) {
  if (callback && typeof callback === 'function') {
    const selectedDetections = getSelectedDetections(detections, selectedIds);
    callback(selectedDetections);
  }
}

/**
 * Select detections whose id is contained in the provided set of selected IDs.
 *
 * @param {Array<Object>} detections - Array of detection objects; each object is expected to have an `id` property.
 * @param {Set<string>} selectedIds - Set of detection IDs to include.
 * @returns {Array<Object>} Array of detection objects from `detections` whose `id` is present in `selectedIds`.
 */
export function getSelectedDetections(detections, selectedIds) {
  return detections.filter(detection =>
    detection.id && selectedIds.has(detection.id)
  );
}