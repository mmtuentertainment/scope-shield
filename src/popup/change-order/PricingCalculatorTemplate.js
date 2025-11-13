/**
 * Pricing Calculator Templates
 *
 * HTML template generation for the PricingCalculatorWidget component.
 * Provides the structure for the inline calculator interface.
 *
 * @module PricingCalculatorTemplate
 */

/**
 * Get widget HTML structure
 *
 * @returns {string} HTML string for pricing calculator widget
 */
export function getWidgetHTML() {
  return `
    <div class="pricing-calculator-content">
      <h4 class="calc-title">💵 Price Calculator</h4>

      <div class="calc-input-group">
        <label for="calc-hourly-rate">Hourly Rate ($)</label>
        <input
          type="number"
          id="calc-hourly-rate"
          class="calc-input"
          placeholder="150"
          min="1"
          step="0.01"
        />
      </div>

      <div class="calc-input-group">
        <label for="calc-estimated-hours">Estimated Hours</label>
        <input
          type="number"
          id="calc-estimated-hours"
          class="calc-input"
          placeholder="8"
          min="0.1"
          step="0.5"
        />
      </div>

      <div id="calc-result" class="calc-result"></div>

      <div class="calc-actions">
        <button id="calc-accept-btn" class="btn btn-primary" disabled>
          Accept
        </button>
        <button id="calc-cancel-btn" class="btn btn-secondary">
          Cancel
        </button>
      </div>
    </div>
  `;
}
