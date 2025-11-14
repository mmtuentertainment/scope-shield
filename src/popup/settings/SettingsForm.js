// T046: Settings Form component

import { SettingsStorage } from '../../lib/storage/SettingsStorage.js';
import { FreelancerSettings } from '../../lib/storage/FreelancerSettings.js';
import { sanitizeText, sanitizeNumber } from '../../lib/utils/Sanitizer.js';
import { logInfo, logError } from '../../lib/utils/Logger.js';
import { getFormHTML } from './SettingsFormTemplate.js';

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

    // T048-T052: Render form template (extracted for modularity)
    form.innerHTML = getFormHTML();

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
      const isVisible = e.target.checked;
      delayGroup.style.display = isVisible ? 'block' : 'none';
      delayGroup.setAttribute('aria-hidden', !isVisible);
    });

    // Initialize delay group visibility and accessibility state
    const isVisible = autoExportCheckbox.checked;
    delayGroup.style.display = isVisible ? 'block' : 'none';
    delayGroup.setAttribute('aria-hidden', !isVisible);
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

    // Update delay group visibility and accessibility state
    const delayGroup = this.formElement.querySelector('#auto-export-delay-group');
    if (delayGroup) {
      const isVisible = settings.autoExportEnabled;
      delayGroup.style.display = isVisible ? 'block' : 'none';
      delayGroup.setAttribute('aria-hidden', !isVisible);
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
