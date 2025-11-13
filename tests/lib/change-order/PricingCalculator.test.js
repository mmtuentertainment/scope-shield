/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest';
import pricingCalculator, { PricingCalculatorService } from '../../../src/lib/change-order/PricingCalculator.js';

describe('PricingCalculator', () => {
  let calculator;

  beforeEach(() => {
    calculator = new PricingCalculatorService();
  });

  describe('calculate()', () => {
    it('should calculate cost estimate correctly', () => {
      const result = calculator.calculate(150, 8);

      expect(result.rawAmount).toBe(1200);
      expect(result.formattedCurrency).toBe('$1,200');
    });

    it('should handle decimal hourly rates', () => {
      const result = calculator.calculate(87.50, 10);

      expect(result.rawAmount).toBe(875);
      expect(result.formattedCurrency).toBe('$875');
    });

    it('should handle decimal estimated hours', () => {
      const result = calculator.calculate(100, 2.5);

      expect(result.rawAmount).toBe(250);
      expect(result.formattedCurrency).toBe('$250');
    });

    it('should handle fractional hours', () => {
      const result = calculator.calculate(120, 0.5);

      expect(result.rawAmount).toBe(60);
      expect(result.formattedCurrency).toBe('$60');
    });

    it('should handle large estimates', () => {
      const result = calculator.calculate(200, 100);

      expect(result.rawAmount).toBe(20000);
      expect(result.formattedCurrency).toBe('$20,000');
    });

    it('should throw error if hourly rate is zero', () => {
      expect(() => calculator.calculate(0, 10)).toThrow('Hourly rate must be a positive number');
    });

    it('should throw error if hourly rate is negative', () => {
      expect(() => calculator.calculate(-150, 10)).toThrow('Hourly rate must be a positive number');
    });

    it('should throw error if estimated hours is zero', () => {
      expect(() => calculator.calculate(150, 0)).toThrow('Estimated hours must be a positive number');
    });

    it('should throw error if estimated hours is negative', () => {
      expect(() => calculator.calculate(150, -5)).toThrow('Estimated hours must be a positive number');
    });

    it('should throw error if hourly rate is not a number', () => {
      expect(() => calculator.calculate('150', 10)).toThrow('Hourly rate must be a positive number');
    });

    it('should throw error if estimated hours is not a number', () => {
      expect(() => calculator.calculate(150, '10')).toThrow('Estimated hours must be a positive number');
    });

    it('should throw error if hourly rate is NaN', () => {
      expect(() => calculator.calculate(NaN, 10)).toThrow('Hourly rate must be a positive number');
    });

    it('should throw error if estimated hours is NaN', () => {
      expect(() => calculator.calculate(150, NaN)).toThrow('Estimated hours must be a positive number');
    });
  });

  describe('calculateFormatted()', () => {
    it('should return formatted currency string only', () => {
      const result = calculator.calculateFormatted(150, 8);

      expect(result).toBe('$1,200');
      expect(typeof result).toBe('string');
    });

    it('should handle decimal values', () => {
      const result = calculator.calculateFormatted(87.50, 10);

      expect(result).toBe('$875');
    });

    it('should throw error on invalid inputs', () => {
      expect(() => calculator.calculateFormatted(0, 10)).toThrow();
      expect(() => calculator.calculateFormatted(150, -5)).toThrow();
    });
  });

  describe('validate()', () => {
    it('should validate correct inputs', () => {
      const result = calculator.validate(150, 8);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate decimal inputs', () => {
      const result = calculator.validate(87.50, 2.5);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject zero hourly rate', () => {
      const result = calculator.validate(0, 10);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Hourly rate must be greater than 0');
    });

    it('should reject negative hourly rate', () => {
      const result = calculator.validate(-150, 10);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Hourly rate must be greater than 0');
    });

    it('should reject zero estimated hours', () => {
      const result = calculator.validate(150, 0);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Estimated hours must be greater than 0');
    });

    it('should reject negative estimated hours', () => {
      const result = calculator.validate(150, -5);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Estimated hours must be greater than 0');
    });

    it('should reject non-number hourly rate', () => {
      const result = calculator.validate('150', 10);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Hourly rate must be a valid number');
    });

    it('should reject non-number estimated hours', () => {
      const result = calculator.validate(150, '10');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Estimated hours must be a valid number');
    });

    it('should reject NaN hourly rate', () => {
      const result = calculator.validate(NaN, 10);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Hourly rate must be a valid number');
    });

    it('should reject NaN estimated hours', () => {
      const result = calculator.validate(150, NaN);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Estimated hours must be a valid number');
    });

    it('should return multiple errors for multiple invalid inputs', () => {
      const result = calculator.validate(-150, -10);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors).toContain('Hourly rate must be greater than 0');
      expect(result.errors).toContain('Estimated hours must be greater than 0');
    });
  });

  describe('Singleton instance', () => {
    it('should export a singleton instance', () => {
      expect(pricingCalculator).toBeInstanceOf(PricingCalculatorService);
    });

    it('should calculate using singleton', () => {
      const result = pricingCalculator.calculate(150, 8);

      expect(result.rawAmount).toBe(1200);
      expect(result.formattedCurrency).toBe('$1,200');
    });
  });

  describe('Real-world scenarios', () => {
    it('should calculate typical freelance project (40 hours at $150/hr)', () => {
      const result = calculator.calculate(150, 40);

      expect(result.rawAmount).toBe(6000);
      expect(result.formattedCurrency).toBe('$6,000');
    });

    it('should calculate small change order (3 hours at $100/hr)', () => {
      const result = calculator.calculate(100, 3);

      expect(result.rawAmount).toBe(300);
      expect(result.formattedCurrency).toBe('$300');
    });

    it('should calculate large enterprise project (200 hours at $250/hr)', () => {
      const result = calculator.calculate(250, 200);

      expect(result.rawAmount).toBe(50000);
      expect(result.formattedCurrency).toBe('$50,000');
    });

    it('should calculate quick fix (0.5 hours at $120/hr)', () => {
      const result = calculator.calculate(120, 0.5);

      expect(result.rawAmount).toBe(60);
      expect(result.formattedCurrency).toBe('$60');
    });
  });
});
