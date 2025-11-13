/**
 * Pricing Calculator Widget
 *
 * Inline expansion calculator for estimating change order costs.
 * Appears when cost estimate field is clicked, allows quick calculation
 * of hourly rate × estimated hours = cost estimate.
 *
 * @module PricingCalculatorWidget
 */

import pricingCalculator from '../../lib/change-order/PricingCalculator.js';
import { logInfo, logError } from '../../lib/utils/Logger.js';
import { getWidgetHTML } from './PricingCalculatorTemplate.js';
import {
  loadHourlyRate,
  saveHourlyRate
} from './PricingCalculatorSettings.js';

class PricingCalculatorWidget {
  constructor() {
    this.isVisible = false;
    this.container = null;
    this.hourlyRateInput = null;
    this.estimatedHoursInput = null;
    this.resultDisplay = null;
    this.acceptButton = null;
    this.cancelButton = null;
    this.onAcceptCallback = null;
  }

  /**
   * Initialize the widget and inject HTML
   *
   * @param {HTMLElement} targetElement - Element to attach widget to (cost estimate field)
   * @param {Function} onAccept - Callback when user accepts calculation (receives formatted currency)
   */
  async init(targetElement, onAccept) {
    try {
      this.targetElement = targetElement;
      this.onAcceptCallback = onAccept;

      // Create widget container (delegate to template)
      this.container = document.createElement('div');
      this.container.className = 'pricing-calculator-widget';
      this.container.style.display = 'none';
      this.container.innerHTML = getWidgetHTML();

      // Insert after target element
      targetElement.parentNode.insertBefore(this.container, targetElement.nextSibling);

      // Get references to elements
      this.hourlyRateInput = this.container.querySelector('#calc-hourly-rate');
      this.estimatedHoursInput = this.container.querySelector('#calc-estimated-hours');
      this.resultDisplay = this.container.querySelector('#calc-result');
      this.acceptButton = this.container.querySelector('#calc-accept-btn');
      this.cancelButton = this.container.querySelector('#calc-cancel-btn');

      // Attach event listeners
      this._attachEventListeners();

      // Load hourly rate from settings
      await this._loadHourlyRateFromSettings();

      logInfo('PricingCalculatorWidget.init: Widget initialized');
    } catch (error) {
      logError('PricingCalculatorWidget.init: Initialization failed', error);
      throw error;
    }
  }

  /**
   * Show the calculator widget
   */
  show() {
    if (!this.container) return;

    this.container.style.display = 'block';
    this.isVisible = true;

    // Focus on estimated hours input (hourly rate should already be pre-filled)
    if (this.estimatedHoursInput) {
      this.estimatedHoursInput.focus();
    }

    logInfo('PricingCalculatorWidget.show: Widget shown');
  }

  /**
   * Hide the calculator widget
   */
  hide() {
    if (!this.container) return;

    this.container.style.display = 'none';
    this.isVisible = false;

    // Clear inputs
    if (this.estimatedHoursInput) {
      this.estimatedHoursInput.value = '';
    }
    if (this.resultDisplay) {
      this.resultDisplay.textContent = '';
    }

    logInfo('PricingCalculatorWidget.hide: Widget hidden');
  }

  /**
   * Toggle visibility of calculator widget
   */
  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Load hourly rate from settings and pre-fill input (delegates to settings module)
   * @private
   */
  async _loadHourlyRateFromSettings() {
    const hourlyRate = await loadHourlyRate();
    if (hourlyRate && this.hourlyRateInput) {
      this.hourlyRateInput.value = hourlyRate;
    }
  }

  /**
   * Save hourly rate to settings for future use (delegates to settings module)
   * @private
   * @param {number} hourlyRate - Rate to save
   */
  async _saveHourlyRateToSettings(hourlyRate) {
    await saveHourlyRate(hourlyRate);
  }

  /**
   * Calculate and display result
   * @private
   */
  _calculate() {
    try {
      const hourlyRate = parseFloat(this.hourlyRateInput.value);
      const estimatedHours = parseFloat(this.estimatedHoursInput.value);

      // Validate inputs
      const validation = pricingCalculator.validate(hourlyRate, estimatedHours);
      if (!validation.isValid) {
        this.resultDisplay.textContent = validation.errors[0];
        this.resultDisplay.className = 'calc-result error';
        this.acceptButton.disabled = true;
        return;
      }

      // Calculate
      const result = pricingCalculator.calculate(hourlyRate, estimatedHours);

      // Display result
      this.resultDisplay.textContent = `Estimated cost: ${result.formattedCurrency}`;
      this.resultDisplay.className = 'calc-result success';
      this.acceptButton.disabled = false;

      // Save hourly rate to settings
      this._saveHourlyRateToSettings(hourlyRate);
    } catch (error) {
      logError('PricingCalculatorWidget._calculate: Calculation failed', error);
      this.resultDisplay.textContent = 'Calculation error';
      this.resultDisplay.className = 'calc-result error';
      this.acceptButton.disabled = true;
    }
  }

  /**
   * Handle accept button click
   * @private
   */
  _handleAccept() {
    try {
      const hourlyRate = parseFloat(this.hourlyRateInput.value);
      const estimatedHours = parseFloat(this.estimatedHoursInput.value);

      // Calculate formatted result
      const result = pricingCalculator.calculate(hourlyRate, estimatedHours);

      // Call callback with formatted currency
      if (this.onAcceptCallback) {
        this.onAcceptCallback(result.formattedCurrency);
      }

      // Hide widget
      this.hide();

      logInfo('PricingCalculatorWidget._handleAccept: Calculation accepted', {
        result: result.formattedCurrency
      });
    } catch (error) {
      logError('PricingCalculatorWidget._handleAccept: Accept failed', error);
    }
  }

  /**
   * Attach event listeners to widget elements
   * @private
   */
  _attachEventListeners() {
    // Auto-calculate on input change (debounced)
    let debounceTimer;
    const debouncedCalculate = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => this._calculate(), 300);
    };

    this.hourlyRateInput.addEventListener('input', debouncedCalculate);
    this.estimatedHoursInput.addEventListener('input', debouncedCalculate);

    // Accept button
    this.acceptButton.addEventListener('click', () => this._handleAccept());

    // Cancel button
    this.cancelButton.addEventListener('click', () => this.hide());

    // Enter key to accept (if button enabled)
    this.container.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !this.acceptButton.disabled) {
        this._handleAccept();
      }
    });
  }

  /**
   * Destroy the widget and clean up
   */
  destroy() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }

    this.container = null;
    this.hourlyRateInput = null;
    this.estimatedHoursInput = null;
    this.resultDisplay = null;
    this.acceptButton = null;
    this.cancelButton = null;
    this.onAcceptCallback = null;

    logInfo('PricingCalculatorWidget.destroy: Widget destroyed');
  }
}

export default PricingCalculatorWidget;
