/**
 * ChangeOrderModal Integrations
 *
 * Handles calculator, export, and auto-export integrations for ChangeOrderModal.
 * Extracted to maintain 250-line limit per file (code-standards.md).
 *
 * @module ChangeOrderModalIntegrations
 */

import { PricingCalculatorWidget } from '../../lib/change-order/PricingCalculatorWidget.js';
import { ExportControls } from './ExportControls.js';
import { AutoExportTimer } from '../../lib/change-order/AutoExportTimer.js';
import { ExportService } from '../../lib/change-order/export/ExportService.js';
import { SettingsStorage } from '../../lib/storage/SettingsStorage.js';
import { showNotification } from './NotificationManager.js';
import { logInfo, logError } from '../../lib/utils/Logger.js';

/**
 * Integration helper for ChangeOrderModal
 * Manages calculator, export controls, and auto-export timer lifecycle
 */
export class ChangeOrderModalIntegrations {
  /**
   * @param {Object} modal - Reference to parent ChangeOrderModal instance
   */
  constructor(modal) {
    this.modal = modal;
  }

  /**
   * Mount calculator widget
   * @param {HTMLElement} container - Container element
   */
  mountCalculator(container) {
    this.modal.calculator = new PricingCalculatorWidget({
      initialRate: this.modal.calculatorOptions.hourlyRate || 0,
      initialHours: this.modal.calculatorOptions.estimatedHours || 0,
      onCalculate: (values) => {
        // Debounced recalculation when rate or hours change
        this.modal.debouncedRecalculate(values.rate, values.hours);
      }
    });

    const calculatorElement = this.modal.calculator.render();
    container.appendChild(calculatorElement);
  }

  /**
   * Mount export controls
   * @param {HTMLElement} container - Container element
   */
  mountExportControls(container) {
    this.modal.exportControls = new ExportControls(this.modal.changeOrderText, {
      clientName: this.modal.metadata.clientName,
      freelancerName: this.modal.metadata.freelancerName,
      date: this.modal.metadata.date
    });

    const exportElement = this.modal.exportControls.render();
    container.appendChild(exportElement);
  }

  /**
   * Update export controls with new document text
   */
  updateExportControls() {
    if (!this.modal.exportControls) {
      return;
    }

    // Get container
    const container = this.modal.modal.querySelector('.export-container');
    if (!container) {
      return;
    }

    // Cleanup old instance
    this.modal.exportControls.destroy();

    // Clear container
    container.textContent = '';

    // Create new instance with updated text
    this.mountExportControls(container);
  }

  /**
   * Recalculate document with new pricing
   * @param {number} newRate - New hourly rate
   * @param {number} newHours - New estimated hours
   */
  async recalculateDocument(newRate, newHours) {
    if (!this.modal.calculatorOptions.onRecalculate) {
      logError('ChangeOrderModal: onRecalculate callback not provided', new Error('Missing callback'));
      return;
    }

    try {
      logInfo(`ChangeOrderModal: Recalculating with rate=${newRate}, hours=${newHours}`);

      // Call the recalculate callback (async)
      const newDocument = await this.modal.calculatorOptions.onRecalculate(newRate, newHours);

      // Guard: Check if modal still exists before updating
      if (!this.modal.modal || !this.modal.documentPreview) {
        logInfo('ChangeOrderModal: Modal closed during recalculation, skipping update');
        return;
      }

      // Update document
      this.modal.updateDocument(newDocument);

      // Restart auto-export timer after document rebuild
      // (starts even if previously cancelled/completed - enables continuous auto-export)
      if (this.modal.autoExportTimer) {
        // Set flag when restarting timer
        this.modal.autoExportActive = true;

        if (this.modal.autoExportTimer.isActive()) {
          this.modal.autoExportTimer.reset();
        } else {
          // Timer was cancelled or already fired - restart it
          this.modal.autoExportTimer.start();
        }
      }
    } catch (error) {
      logError('ChangeOrderModal: Recalculation failed', error);

      // Notify user of failure
      showNotification(
        'recalc-error',
        'Failed to update document. Please try again.',
        'error',
        5000
      );
    }
  }

  /**
   * Initialize auto-export timer
   * Loads settings and starts countdown if enabled
   */
  async initializeAutoExport() {
    try {
      // Load settings
      const settings = await SettingsStorage.get();

      // Guard: Modal may have closed during async settings load
      if (!this.modal.modal) {
        logInfo('ChangeOrderModal: Modal closed before auto-export initialization; skipping timer');
        return;
      }

      // Check if auto-export enabled
      if (!settings.autoExportEnabled) {
        logInfo('ChangeOrderModal: Auto-export disabled in settings');
        return;
      }

      const delay = settings.autoExportDelay || 5;
      const method = settings.defaultExportMethod || 'pdf';

      logInfo(`ChangeOrderModal: Initializing auto-export (delay=${delay}s, method=${method})`);

      // Create timer
      this.modal.autoExportTimer = new AutoExportTimer({
        delay,
        onExport: async () => {
          await this.executeAutoExport(method);
        },
        onCountdown: (secondsLeft) => {
          this.updateCountdownUI(secondsLeft);
        },
        onCancel: () => {
          // Clear auto-export flag when timer is cancelled
          this.modal.autoExportActive = false;
          this.hideCountdownUI();
        }
      });

      // Start timer and set auto-export active flag
      this.modal.autoExportActive = true;
      this.modal.autoExportTimer.start();
    } catch (error) {
      logError('ChangeOrderModal: Failed to initialize auto-export', error);

      // Show user-facing error notification
      showNotification(
        'auto-export-init-error',
        'Auto-export could not be initialized. Please export manually.',
        'warning',
        5000
      );
    }
  }

  /**
   * Execute auto-export
   * Calls ExportService with settings-based export method
   * @param {string} method - Export method ('clipboard'|'pdf'|'text')
   */
  async executeAutoExport(method) {
    try {
      logInfo(`ChangeOrderModal: Executing auto-export (method=${method})`);

      // Hide countdown UI
      this.hideCountdownUI();

      // Call ExportService
      const result = await ExportService.export(this.modal.changeOrderText, method, this.modal.metadata);

      if (result.success) {
        // Show success notification
        const methodLabels = {
          clipboard: 'Clipboard',
          pdf: 'PDF',
          text: 'Text File'
        };

        showNotification(
          'auto-export-success',
          `Auto-exported as ${methodLabels[method] || method}`,
          'success',
          3000
        );

        logInfo('ChangeOrderModal: Auto-export succeeded');

        // Clear auto-export flag after successful export
        this.modal.autoExportActive = false;
      } else {
        // Show error notification with manual fallback
        throw new Error(result.error || 'Export failed');
      }
    } catch (error) {
      logError('ChangeOrderModal: Auto-export failed', error);

      // Clear auto-export flag on failure
      this.modal.autoExportActive = false;

      showNotification(
        'auto-export-error',
        'Auto-export failed. Please use manual export buttons.',
        'error',
        5000
      );
    }
  }

  /**
   * Update countdown notification UI
   * @param {number} secondsLeft - Seconds remaining
   */
  updateCountdownUI(secondsLeft) {
    if (!this.modal.countdownNotification) {
      return;
    }

    // Show notification
    this.modal.countdownNotification.style.display = 'block';

    // Update text (special message when export is imminent)
    if (secondsLeft === 0) {
      this.modal.countdownNotification.textContent = 'Auto-exporting now...';
    } else {
      this.modal.countdownNotification.textContent = `Auto-exporting in ${secondsLeft}s... (click anywhere to cancel)`;
    }
  }

  /**
   * Hide countdown notification UI
   */
  hideCountdownUI() {
    if (!this.modal.countdownNotification) {
      return;
    }

    this.modal.countdownNotification.style.display = 'none';
  }
}
