// Pricing Calculator Widget
// Interactive UI for cost estimation

import { logInfo } from '../utils/Logger.js';

/**
 * Pricing Calculator Widget
 * Provides inline calculator UI for cost estimation
 */
export class PricingCalculatorWidget {
  /**
   * @param {Object} options - Widget options
   * @param {number} options.initialRate - Initial hourly rate
   * @param {number} options.initialHours - Initial estimated hours
   * @param {Function} options.onCalculate - Callback when calculation changes
   */
  constructor(options = {}) {
    this.rate = options.initialRate || 0;
    this.hours = options.initialHours || 0;
    this.onCalculate = options.onCalculate || (() => {});
    this.container = null;
    this.inputs = {};
  }

  /**
   * Render calculator widget
   * @returns {HTMLElement}
   */
  render() {
    this.container = document.createElement('div');
    this.container.className = 'calculator-widget';

    // Create header
    const header = document.createElement('h4');
    header.textContent = 'Cost Calculator';
    header.className = 'calculator-header';
    this.container.appendChild(header);

    // Create input container
    const inputsDiv = document.createElement('div');
    inputsDiv.className = 'calculator-inputs';

    // Hourly rate input
    const rateGroup = this.createInputGroup('Hourly Rate', {
      name: 'rate',
      value: this.rate,
      unit: '$',
      type: 'number'
    });
    inputsDiv.appendChild(rateGroup);

    // Estimated hours input
    const hoursGroup = this.createInputGroup('Estimated Hours', {
      name: 'hours',
      value: this.hours,
      unit: 'hrs',
      type: 'number'
    });
    inputsDiv.appendChild(hoursGroup);

    this.container.appendChild(inputsDiv);

    // Create result display
    const resultDiv = this.createResultDisplay();
    this.container.appendChild(resultDiv);

    return this.container;
  }

  /**
   * Create result display element
   * @returns {HTMLElement}
   * @private
   */
  createResultDisplay() {
    const resultDiv = document.createElement('div');
    resultDiv.className = 'calculator-result';

    const resultLabel = document.createElement('span');
    resultLabel.textContent = 'Total Cost:';
    resultLabel.className = 'calculator-result-label';

    const resultValue = document.createElement('span');
    resultValue.textContent = this.formatCost(this.calculateCost());
    resultValue.className = 'calculator-result-value';

    resultDiv.appendChild(resultLabel);
    resultDiv.appendChild(resultValue);

    return resultDiv;
  }

  /**
   * Create input element
   * @param {string} name - Input name
   * @param {number} value - Initial value
   * @param {string} type - Input type
   * @returns {HTMLInputElement}
   * @private
   */
  createInput(name, value, type) {
    const input = document.createElement('input');
    input.type = type;
    input.id = `calc-${name}`;
    input.name = name;
    input.value = value;
    input.min = '0';
    input.step = name === 'rate' ? '0.01' : '0.5';
    input.className = 'calculator-input';
    return input;
  }

  /**
   * Attach debounced input listener
   * @param {HTMLInputElement} input - Input element
   * @param {string} name - Input name
   * @private
   */
  attachInputListener(input, name) {
    let debounceTimer;
    input.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        this.handleInputChange(name, input.value);
      }, 300);
    });
  }

  /**
   * Create input group
   * @param {string} label - Input label
   * @param {Object} inputConfig - Input configuration {name, value, unit, type}
   * @returns {HTMLElement}
   * @private
   */
  createInputGroup(label, inputConfig) {
    const { name, value, unit, type } = inputConfig;

    const group = document.createElement('div');
    group.className = 'calculator-input-group';

    const labelEl = document.createElement('label');
    labelEl.textContent = label;
    labelEl.className = 'calculator-label';
    labelEl.setAttribute('for', `calc-${name}`);

    const inputWrapper = document.createElement('div');
    inputWrapper.className = 'calculator-input-wrapper';

    const input = this.createInput(name, value, type);

    const unitLabel = document.createElement('span');
    unitLabel.textContent = unit;
    unitLabel.className = 'calculator-unit';

    inputWrapper.appendChild(input);
    inputWrapper.appendChild(unitLabel);

    group.appendChild(labelEl);
    group.appendChild(inputWrapper);

    // Store input reference
    this.inputs[name] = input;

    // Attach debounced listener
    this.attachInputListener(input, name);

    return group;
  }

  /**
   * Handle input change
   * @param {string} name - Input name
   * @param {string} value - New value
   * @private
   */
  handleInputChange(name, value) {
    const numValue = parseFloat(value) || 0;

    // Validate
    if (numValue < 0) {
      return;
    }

    // Update internal state
    if (name === 'rate') {
      this.rate = numValue;
    } else if (name === 'hours') {
      this.hours = numValue;
    }

    // Update result display
    this.updateResult();

    // Fire callback
    this.onCalculate({
      rate: this.rate,
      hours: this.hours,
      total: this.calculateCost()
    });

    logInfo(`PricingCalculatorWidget: Calculated cost: $${this.calculateCost().toFixed(2)}`);
  }

  /**
   * Calculate total cost
   * @returns {number}
   * @private
   */
  calculateCost() {
    return this.rate * this.hours;
  }

  /**
   * Format cost as currency
   * @param {number} cost - Cost value
   * @returns {string}
   * @private
   */
  formatCost(cost) {
    return `$${cost.toFixed(2)}`;
  }

  /**
   * Update result display
   * @private
   */
  updateResult() {
    if (!this.container) return;

    const resultValue = this.container.querySelector('.calculator-result-value');
    if (resultValue) {
      resultValue.textContent = this.formatCost(this.calculateCost());
    }
  }

  /**
   * Get current values
   * @returns {{rate: number, hours: number, total: number}}
   */
  getValue() {
    return {
      rate: this.rate,
      hours: this.hours,
      total: this.calculateCost()
    };
  }

  /**
   * Get current state for draft persistence
   * @returns {{hourlyRate: number, estimatedHours: number}}
   */
  getState() {
    return {
      hourlyRate: this.rate,
      estimatedHours: this.hours
    };
  }

  /**
   * Set values programmatically
   * @param {number} rate - Hourly rate
   * @param {number} hours - Estimated hours
   */
  setValue(rate, hours) {
    this.rate = rate;
    this.hours = hours;

    // Update inputs if rendered
    if (this.inputs.rate) {
      this.inputs.rate.value = rate;
    }
    if (this.inputs.hours) {
      this.inputs.hours.value = hours;
    }

    // Update result
    this.updateResult();
  }

  /**
   * Cleanup widget
   */
  destroy() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }

    this.container = null;
    this.inputs = {};
  }
}
