// T045: Settings View component

import { SettingsStorage } from '../../lib/storage/SettingsStorage.js';
import { SettingsForm } from './SettingsForm.js';
import { logInfo, logError } from '../../lib/utils/Logger.js';

/**
 * Settings View
 * Main container for settings page
 */
export class SettingsView {
  constructor() {
    this.form = null;
  }

  /**
   * Render settings view
   * @returns {Promise<HTMLElement>} Settings container element
   */
  async render() {
    const container = document.createElement('div');
    container.className = 'settings-view';
    container.id = 'settings-view';

    // Create header
    const header = document.createElement('div');
    header.className = 'settings-header';
    header.innerHTML = `
      <h2>Settings</h2>
      <p class="settings-description">Configure your change order preferences</p>
    `;
    container.appendChild(header);

    // Create form instance
    this.form = new SettingsForm();
    const formElement = await this.form.render();
    container.appendChild(formElement);

    // Load existing settings
    await this.loadSettings();

    return container;
  }

  /**
   * T054: Load settings from storage and populate form
   */
  async loadSettings() {
    try {
      logInfo('Loading settings for form');
      const settings = await SettingsStorage.get();

      if (this.form) {
        this.form.populate(settings);
        logInfo('Settings loaded into form', settings);
      }
    } catch (error) {
      logError('Failed to load settings', error);
      this.showError('Failed to load settings. Please try again.');
    }
  }

  /**
   * Show success notification
   * @param {string} message - Success message
   */
  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  /**
   * Show error notification
   * @param {string} message - Error message
   */
  showError(message) {
    this.showNotification(message, 'error');
  }

  /**
   * Show notification with auto-dismiss
   * @param {string} message - Notification message
   * @param {string} type - 'success' or 'error'
   */
  showNotification(message, type = 'success') {
    // Remove existing notifications
    const existing = document.querySelectorAll('.settings-notification');
    existing.forEach(n => n.remove());

    // Create new notification
    const notification = document.createElement('div');
    notification.className = `settings-notification settings-notification-${type}`;
    notification.textContent = message;

    // Insert at top of settings view
    const container = document.getElementById('settings-view');
    if (container) {
      container.insertBefore(notification, container.firstChild);

      // Auto-dismiss after 3 seconds
      setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
      }, 3000);
    }
  }

  /**
   * Clean up (if needed)
   */
  destroy() {
    this.form = null;
  }
}
