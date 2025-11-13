/**
 * Pricing Calculator
 *
 * Simple calculator for estimating change order costs.
 * Calculates: hourlyRate × estimatedHours = cost estimate
 *
 * @module PricingCalculator
 */

import { sanitizeCurrency } from '../utils/Sanitizer.js';
import { logInfo, logError } from '../utils/Logger.js';

class PricingCalculatorService {
  /**
   * Calculate cost estimate from hourly rate and estimated hours
   *
   * @param {number} hourlyRate - Hourly rate in dollars
   * @param {number} estimatedHours - Estimated hours for the work
   * @returns {Object} Result with formatted currency and raw amount
   * @throws {Error} If inputs are invalid
   */
  calculate(hourlyRate, estimatedHours) {
    try {
      // Validate inputs
      if (typeof hourlyRate !== 'number' || isNaN(hourlyRate) || hourlyRate <= 0) {
        throw new Error('Hourly rate must be a positive number');
      }

      if (typeof estimatedHours !== 'number' || isNaN(estimatedHours) || estimatedHours <= 0) {
        throw new Error('Estimated hours must be a positive number');
      }

      // Calculate raw amount
      const rawAmount = hourlyRate * estimatedHours;

      // Format as currency
      const formattedCurrency = sanitizeCurrency(rawAmount);

      logInfo('PricingCalculator.calculate: Calculation complete', {
        hourlyRate,
        estimatedHours,
        rawAmount,
        formattedCurrency
      });

      return {
        rawAmount,
        formattedCurrency
      };
    } catch (error) {
      logError('PricingCalculator.calculate: Calculation failed', error);
      throw error;
    }
  }

  /**
   * Calculate cost estimate and return only formatted string
   * Convenience method for quick calculations
   *
   * @param {number} hourlyRate - Hourly rate in dollars
   * @param {number} estimatedHours - Estimated hours for the work
   * @returns {string} Formatted currency string (e.g., "$1,200")
   * @throws {Error} If inputs are invalid
   */
  calculateFormatted(hourlyRate, estimatedHours) {
    const result = this.calculate(hourlyRate, estimatedHours);
    return result.formattedCurrency;
  }

  /**
   * Validate pricing calculator inputs
   *
   * @param {number} hourlyRate - Hourly rate to validate
   * @param {number} estimatedHours - Estimated hours to validate
   * @returns {Object} Validation result with isValid and errors array
   */
  validate(hourlyRate, estimatedHours) {
    const errors = [];

    if (typeof hourlyRate !== 'number' || isNaN(hourlyRate)) {
      errors.push('Hourly rate must be a valid number');
    } else if (hourlyRate <= 0) {
      errors.push('Hourly rate must be greater than 0');
    }

    if (typeof estimatedHours !== 'number' || isNaN(estimatedHours)) {
      errors.push('Estimated hours must be a valid number');
    } else if (estimatedHours <= 0) {
      errors.push('Estimated hours must be greater than 0');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
const pricingCalculator = new PricingCalculatorService();
export default pricingCalculator;

// Export class for testing
export { PricingCalculatorService };
