/**
 * Multi-Item Selector Component
 *
 * UI component for selecting multiple detection events to bundle
 * into a single change order.
 *
 * @module MultiItemSelector
 */

import { logInfo } from '../../lib/utils/Logger.js';
import {
  renderContainer,
  renderDetectionItem as renderDetectionItemTemplate
} from './MultiItemSelectorTemplate.js';
import {
  updateUI as updateSelectionUI,
  notifySelectionChange as notifyCallback,
  getSelectedDetections as getSelected
} from './SelectionStateManager.js';

class MultiItemSelector {
  constructor(containerSelector = '#multi-item-selector') {
    this.containerSelector = containerSelector;
    this.container = null;
    this.detections = [];
    this.selectedIds = new Set();
    this.onSelectionChange = null; // Callback for selection changes
  }

  /**
   * Initialize the selector
   * @param {Array<Object>} detections - Array of detection events
   * @param {Function} [onSelectionChange] - Callback when selection changes
   */
  init(detections, onSelectionChange = null) {
    this.detections = detections || [];
    this.selectedIds = new Set();
    this.onSelectionChange = onSelectionChange;

    // Select all by default
    this.detections.forEach(detection => {
      if (detection.id) {
        this.selectedIds.add(detection.id);
      }
    });

    this.container = document.querySelector(this.containerSelector);

    if (!this.container) {
      // Create container dynamically
      this.container = document.createElement('div');
      this.container.id = 'multi-item-selector';
      this.container.className = 'multi-item-selector';
      document.body.appendChild(this.container);
    }
  }

  /**
   * Render the selector
   * Only shows if there are 2+ detections
   */
  render() {
    if (!this.container) {
      this.init(this.detections);
    }

    // Hide if less than 2 detections
    if (this.detections.length < 2) {
      this.hide();
      return;
    }

    logInfo('MultiItemSelector.render: Rendering selector', {
      totalDetections: this.detections.length,
      selectedCount: this.selectedIds.size
    });

    // Delegate to template module
    const html = renderContainer(
      this.detections,
      this.selectedIds,
      (detection, index) => this._renderDetectionItem(detection, index)
    );

    this.container.innerHTML = html;
    this._attachEventListeners();
  }

  /**
   * Render individual detection item (delegates to template)
   * @private
   * @param {Object} detection - Detection event
   * @param {number} index - Index in array
   * @returns {string} HTML string
   */
  _renderDetectionItem(detection, index) {
    return renderDetectionItemTemplate(detection, index, this.selectedIds);
  }

  /**
   * Attach event listeners
   * @private
   */
  _attachEventListeners() {
    // Select All button
    const selectAllBtn = document.getElementById('select-all-btn');
    if (selectAllBtn) {
      selectAllBtn.addEventListener('click', () => this.selectAll());
    }

    // Deselect All button
    const deselectAllBtn = document.getElementById('deselect-all-btn');
    if (deselectAllBtn) {
      deselectAllBtn.addEventListener('click', () => this.deselectAll());
    }

    // Individual checkboxes
    const checkboxes = this.container.querySelectorAll('.detection-checkbox');
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const detectionId = e.target.dataset.detectionId;
        if (e.target.checked) {
          this.select(detectionId);
        } else {
          this.deselect(detectionId);
        }
      });
    });
  }

  /**
   * Select a detection
   * @param {string} detectionId - Detection ID
   */
  select(detectionId) {
    this.selectedIds.add(detectionId);
    this._updateUI();
    this._notifySelectionChange();

    logInfo('MultiItemSelector.select: Detection selected', {
      detectionId,
      totalSelected: this.selectedIds.size
    });
  }

  /**
   * Deselect a detection
   * @param {string} detectionId - Detection ID
   */
  deselect(detectionId) {
    this.selectedIds.delete(detectionId);
    this._updateUI();
    this._notifySelectionChange();

    logInfo('MultiItemSelector.deselect: Detection deselected', {
      detectionId,
      totalSelected: this.selectedIds.size
    });
  }

  /**
   * Select all detections
   */
  selectAll() {
    this.detections.forEach(detection => {
      if (detection.id) {
        this.selectedIds.add(detection.id);
      }
    });
    this._updateUI();
    this._notifySelectionChange();

    logInfo('MultiItemSelector.selectAll: All detections selected', {
      totalSelected: this.selectedIds.size
    });
  }

  /**
   * Deselect all detections
   */
  deselectAll() {
    this.selectedIds.clear();
    this._updateUI();
    this._notifySelectionChange();

    logInfo('MultiItemSelector.deselectAll: All detections deselected');
  }

  /**
   * Update UI to reflect current selection (delegates to state manager)
   * @private
   */
  _updateUI() {
    updateSelectionUI(this.container, this.selectedIds, this.detections.length);
  }

  /**
   * Notify selection change callback (delegates to state manager)
   * @private
   */
  _notifySelectionChange() {
    notifyCallback(this.onSelectionChange, this.detections, this.selectedIds);
  }

  /**
   * Get selected detection events (delegates to state manager)
   * @returns {Array<Object>} Array of selected detections
   */
  getSelectedDetections() {
    return getSelected(this.detections, this.selectedIds);
  }

  /**
   * Get selected count
   * @returns {number} Number of selected detections
   */
  getSelectedCount() {
    return this.selectedIds.size;
  }

  /**
   * Check if any detections are selected
   * @returns {boolean} True if at least one selected
   */
  hasSelection() {
    return this.selectedIds.size > 0;
  }

  /**
   * Hide the selector
   */
  hide() {
    if (this.container) {
      this.container.style.display = 'none';
    }
  }

  /**
   * Show the selector
   */
  show() {
    if (this.container) {
      this.container.style.display = 'block';
    }
  }

  /**
   * Clear and reset the selector
   */
  clear() {
    this.detections = [];
    this.selectedIds.clear();
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

// Export singleton instance
const multiItemSelector = new MultiItemSelector();
export default multiItemSelector;

// Export class for testing
export { MultiItemSelector };
