// T062-T063: Welcome Modal for first-run experience

import { FirstRunDetector } from '../lib/utils/FirstRunDetector.js';
import { sanitizeText } from '../lib/utils/Sanitizer.js';

/**
 * Welcome Modal
 * Shown on first popup open to collect freelancer name
 */
export class WelcomeModal {
  constructor() {
    this.modal = null;
  }

  /**
   * T062: Show welcome modal
   * @returns {Promise<void>}
   */
  show() {
    return new Promise((resolve) => {
      // Create modal overlay
      this.modal = document.createElement('div');
      this.modal.className = 'welcome-modal-overlay';
      this.modal.innerHTML = `
        <div class="welcome-modal">
          <div class="welcome-header">
            <img src="../assets/icons/icon48.png" alt="ScopeShield" width="48" height="48">
            <h2>Welcome to ScopeShield!</h2>
          </div>
          <div class="welcome-content">
            <p>Let's get you set up. We need your name to personalize change order documents.</p>
            <form id="welcome-form">
              <div class="form-group">
                <label for="welcome-name" class="form-label">
                  Your Name <span class="required">*</span>
                </label>
                <input
                  type="text"
                  id="welcome-name"
                  name="name"
                  class="form-input"
                  placeholder="e.g., Jane Doe"
                  required
                  maxlength="100"
                  autofocus
                />
                <span class="form-hint">This will appear on your change orders</span>
              </div>
              <div id="welcome-error" class="welcome-error" style="display: none;"></div>
              <div class="form-actions">
                <button type="submit" class="btn btn-primary">
                  Get Started
                </button>
              </div>
            </form>
          </div>
        </div>
      `;

      // Append to body
      document.body.appendChild(this.modal);

      // Set up form submission
      const form = this.modal.querySelector('#welcome-form');
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleSubmit(resolve);
      });

      // Prevent closing by clicking overlay (user must complete setup)
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) {
          // Don't close - first run is required
          this.shake();
        }
      });
    });
  }

  /**
   * T064: Handle form submission and save freelancer name
   * @param {Function} resolve - Promise resolve function
   */
  async handleSubmit(resolve) {
    try {
      const nameInput = this.modal.querySelector('#welcome-name');
      const errorEl = this.modal.querySelector('#welcome-error');
      const submitBtn = this.modal.querySelector('button[type="submit"]');

      // Get and sanitize name
      const name = sanitizeText(nameInput.value, 100);

      // Validate
      if (!name || name.trim() === '') {
        this.showError('Please enter your name');
        return;
      }

      // Show loading state
      submitBtn.textContent = 'Saving...';
      submitBtn.disabled = true;

      // T064: Save to settings
      await FirstRunDetector.completeFirstRun(name);

      // Close modal
      this.close();

      // Resolve promise
      resolve();

    } catch (error) {
      console.error('[WelcomeModal] Error saving name:', error);
      this.showError('Failed to save. Please try again.');

      // Reset button
      const submitBtn = this.modal.querySelector('button[type="submit"]');
      submitBtn.textContent = 'Get Started';
      submitBtn.disabled = false;
    }
  }

  /**
   * Show error message
   * @param {string} message - Error message
   */
  showError(message) {
    const errorEl = this.modal.querySelector('#welcome-error');
    errorEl.textContent = message;
    errorEl.style.display = 'block';

    // Auto-hide after 3 seconds
    setTimeout(() => {
      errorEl.style.display = 'none';
    }, 3000);
  }

  /**
   * Shake animation when user tries to close without completing
   */
  shake() {
    const modalContent = this.modal.querySelector('.welcome-modal');
    modalContent.classList.add('shake');
    setTimeout(() => {
      modalContent.classList.remove('shake');
    }, 500);
  }

  /**
   * Close and remove modal
   */
  close() {
    if (this.modal) {
      this.modal.classList.add('fade-out');
      setTimeout(() => {
        this.modal.remove();
        this.modal = null;
      }, 300);
    }
  }
}
