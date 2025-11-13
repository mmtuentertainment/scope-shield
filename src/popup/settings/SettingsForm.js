// T046: Settings Form component

import { SettingsStorage } from '../../lib/storage/SettingsStorage.js';
import { FreelancerSettings } from '../../lib/storage/FreelancerSettings.js';
import { sanitizeText, sanitizeNumber } from '../../lib/utils/Sanitizer.js';
import { logInfo, logError } from '../../lib/utils/Logger.js';

/**
 * Settings Form
 * Handles form rendering, validation, and submission
 */
export class SettingsForm {
  constructor() {
    this.formElement = null;
  }

  /**
   * Render settings form
   * @returns {Promise<HTMLElement>} Form element
   */
  async render() {
    const form = document.createElement('form');
    form.className = 'settings-form';
    form.id = 'settings-form';

    form.innerHTML = `
      <!-- T048: Freelancer Name Field -->
      <div class="form-group">
        <label for="freelancer-name" class="form-label">
          Your Name <span class="required">*</span>
        </label>
        <input
          type="text"
          id="freelancer-name"
          name="freelancerName"
          class="form-input"
          placeholder="e.g., Jane Doe"
          required
          maxlength="100"
        />
        <span class="form-hint">Used in change order documents</span>
      </div>

      <!-- T049: Hourly Rate Field -->
      <div class="form-group">
        <label for="hourly-rate" class="form-label">
          Hourly Rate (USD)
        </label>
        <input
          type="number"
          id="hourly-rate"
          name="hourlyRate"
          class="form-input"
          placeholder="e.g., 150"
          min="0"
          max="10000"
          step="1"
        />
        <span class="form-hint">Optional. Used for pricing calculator suggestions.</span>
      </div>

      <!-- T050: Default Export Method Dropdown -->
      <div class="form-group">
        <label for="export-method" class="form-label">
          Default Export Method
        </label>
        <select id="export-method" name="defaultExportMethod" class="form-select">
          <option value="clipboard">Copy to Clipboard</option>
          <option value="pdf">Export as PDF</option>
          <option value="text">Export as Text</option>
        </select>
        <span class="form-hint">Default method for exporting change orders</span>
      </div>

      <!-- T051: Auto-Export Enabled Checkbox -->
      <div class="form-group">
        <label class="form-checkbox-label">
          <input
            type="checkbox"
            id="auto-export-enabled"
            name="autoExportEnabled"
            class="form-checkbox"
          />
          <span>Enable auto-export after editing</span>
        </label>
        <span class="form-hint">Automatically export change orders after you finish editing</span>
      </div>

      <!-- T052: Auto-Export Delay Input -->
      <div class="form-group" id="auto-export-delay-group">
        <label for="auto-export-delay" class="form-label">
          Auto-Export Delay (seconds)
        </label>
        <input
          type="number"
          id="auto-export-delay"
          name="autoExportDelay"
          class="form-input"
          min="1"
          max="10"
          step="1"
          value="3"
        />
        <span class="form-hint">Wait time before auto-exporting (1-10 seconds)</span>
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <button type="submit" class="btn btn-primary" id="save-settings-btn">
          Save Settings
        </button>
        <button type="button" class="btn btn-secondary" id="cancel-settings-btn">
          Cancel
        </button>
      </div>

      <!-- Validation Errors Container -->
      <div id="validation-errors" class="validation-errors" style="display: none;"></div>
    `;

    this.formElement = form;

    // Attach event listeners
    this.attachEventListeners();

    return form;
  }

  /**
   * Attach event listeners to form elements
   */
  attachEventListeners() {
    // T053: Form submission
    this.formElement.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleSubmit();
    });

    // Cancel button
    const cancelBtn = this.formElement.querySelector('#cancel-settings-btn');
    cancelBtn.addEventListener('click', () => {
      this.handleCancel();
    });

    // Auto-export checkbox toggle
    const autoExportCheckbox = this.formElement.querySelector('#auto-export-enabled');
    const delayGroup = this.formElement.querySelector('#auto-export-delay-group');

    autoExportCheckbox.addEventListener('change', (e) => {
      // Show/hide delay input based on checkbox
      delayGroup.style.display = e.target.checked ? 'block' : 'none';
    });

    // Initialize delay group visibility
    delayGroup.style.display = autoExportCheckbox.checked ? 'block' : 'none';
  }

  /**
   * T053: Handle form submission and save settings
   */
  async handleSubmit() {
    try {
      // Show loading state
      const submitBtn = this.formElement.querySelector('#save-settings-btn');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Saving...';
      submitBtn.disabled = true;

      // Collect and sanitize form data
      const formData = new FormData(this.formElement);

      const freelancerName = sanitizeText(formData.get('freelancerName'), 100);
      const hourlyRateRaw = formData.get('hourlyRate');
      const hourlyRate = hourlyRateRaw ? sanitizeNumber(hourlyRateRaw, 0, 10000) : 0;
      const defaultExportMethod = formData.get('defaultExportMethod');
      const autoExportEnabled = formData.get('autoExportEnabled') === 'on';
      const autoExportDelayRaw = formData.get('autoExportDelay');
      const autoExportDelay = autoExportDelayRaw ? sanitizeNumber(autoExportDelayRaw, 1, 10) : 3;

      // Create settings instance
      const settings = new FreelancerSettings({
        freelancerName,
        hourlyRate,
        defaultExportMethod,
        autoExportEnabled,
        autoExportDelay
      });

      // Validate
      const validation = settings.validate();
      if (!validation.valid) {
        this.showValidationErrors(validation.errors);
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        return;
      }

      // Save to storage
      await SettingsStorage.save(settings);

      logInfo('Settings saved successfully', settings.toJSON());

      // T055: Show success notification
      this.showSuccessNotification();

      // Reset button state
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;

    } catch (error) {
      logError('Failed to save settings', error);

      // T056: Show error notification
      this.showErrorNotification(error.message);

      // Reset button state
      const submitBtn = this.formElement.querySelector('#save-settings-btn');
      submitBtn.textContent = 'Save Settings';
      submitBtn.disabled = false;
    }
  }

  /**
   * Handle cancel button click
   */
  handleCancel() {
    // Reload settings to discard changes
    const view = document.querySelector('.settings-view');
    if (view && view.__settingsView) {
      view.__settingsView.loadSettings();
    }
  }

  /**
   * T054: Populate form with settings data
   * @param {FreelancerSettings} settings - Settings to populate
   */
  populate(settings) {
    if (!this.formElement) return;

    // Populate form fields
    const nameInput = this.formElement.querySelector('#freelancer-name');
    const rateInput = this.formElement.querySelector('#hourly-rate');
    const methodSelect = this.formElement.querySelector('#export-method');
    const autoExportCheckbox = this.formElement.querySelector('#auto-export-enabled');
    const delayInput = this.formElement.querySelector('#auto-export-delay');

    if (nameInput) nameInput.value = settings.freelancerName || '';
    if (rateInput) rateInput.value = settings.hourlyRate || '';
    if (methodSelect) methodSelect.value = settings.defaultExportMethod || 'pdf';
    if (autoExportCheckbox) autoExportCheckbox.checked = settings.autoExportEnabled;
    if (delayInput) delayInput.value = settings.autoExportDelay || 3;

    // Update delay group visibility
    const delayGroup = this.formElement.querySelector('#auto-export-delay-group');
    if (delayGroup) {
      delayGroup.style.display = settings.autoExportEnabled ? 'block' : 'none';
    }
  }

  /**
   * Show validation errors
   * @param {string[]} errors - Validation error messages
   */
  showValidationErrors(errors) {
    const errorsContainer = this.formElement.querySelector('#validation-errors');
    errorsContainer.innerHTML = `
      <div class="error-list">
        <strong>Please fix the following errors:</strong>
        <ul>
          ${errors.map(err => `<li>${err}</li>`).join('')}
        </ul>
      </div>
    `;
    errorsContainer.style.display = 'block';

    // Auto-hide after 5 seconds
    setTimeout(() => {
      errorsContainer.style.display = 'none';
    }, 5000);
  }

  /**
   * T055: Show success notification
   */
  showSuccessNotification() {
    // Dispatch custom event for SettingsView to handle
    const event = new CustomEvent('settings-saved', {
      detail: { message: 'Settings saved successfully!' }
    });
    window.dispatchEvent(event);
  }

  /**
   * T056: Show error notification
   * @param {string} message - Error message
   */
  showErrorNotification(message) {
    // Dispatch custom event for SettingsView to handle
    const event = new CustomEvent('settings-error', {
      detail: { message: message || 'Failed to save settings. Please try again.' }
    });
    window.dispatchEvent(event);
  }
}
