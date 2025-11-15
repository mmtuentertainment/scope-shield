// PricingCalculatorWidget Tests

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PricingCalculatorWidget } from '../../../src/lib/change-order/PricingCalculatorWidget.js';

describe('PricingCalculatorWidget', () => {
  let calculator;
  let mockOnCalculate;

  beforeEach(() => {
    mockOnCalculate = vi.fn();
    calculator = new PricingCalculatorWidget({
      initialRate: 150,
      initialHours: 8,
      onCalculate: mockOnCalculate
    });

    vi.useFakeTimers();
  });

  afterEach(() => {
    calculator.destroy();
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe('render', () => {
    it('should create calculator widget container', () => {
      const container = calculator.render();

      expect(container).toBeInstanceOf(HTMLElement);
      expect(container.className).toBe('calculator-widget');
    });

    it('should render header', () => {
      const container = calculator.render();
      const header = container.querySelector('h4');

      expect(header).toBeTruthy();
      expect(header.textContent).toBe('Cost Calculator');
    });

    it('should render rate input with initial value', () => {
      const container = calculator.render();
      const rateInput = container.querySelector('#calc-rate');

      expect(rateInput).toBeTruthy();
      expect(rateInput.value).toBe('150');
      expect(rateInput.type).toBe('number');
    });

    it('should render hours input with initial value', () => {
      const container = calculator.render();
      const hoursInput = container.querySelector('#calc-hours');

      expect(hoursInput).toBeTruthy();
      expect(hoursInput.value).toBe('8');
    });

    it('should display calculated total', () => {
      const container = calculator.render();
      const result = container.querySelector('.calculator-result-value');

      expect(result).toBeTruthy();
      expect(result.textContent).toBe('$1200.00'); // 150 * 8
    });
  });

  describe('calculation', () => {
    it('should calculate cost correctly', () => {
      calculator.rate = 150;
      calculator.hours = 8;

      expect(calculator.calculateCost()).toBe(1200);
    });

    it('should handle decimal values', () => {
      calculator.rate = 125.50;
      calculator.hours = 6.5;

      expect(calculator.calculateCost()).toBe(815.75);
    });

    it('should handle zero rate', () => {
      calculator.rate = 0;
      calculator.hours = 10;

      expect(calculator.calculateCost()).toBe(0);
    });

    it('should handle zero hours', () => {
      calculator.rate = 150;
      calculator.hours = 0;

      expect(calculator.calculateCost()).toBe(0);
    });
  });

  describe('input changes', () => {
    it('should update on rate change (debounced)', () => {
      const container = calculator.render();
      const rateInput = container.querySelector('#calc-rate');

      rateInput.value = '200';
      rateInput.dispatchEvent(new Event('input'));

      // Advance timers past debounce delay
      vi.advanceTimersByTime(300);

      expect(mockOnCalculate).toHaveBeenCalledWith({
        rate: 200,
        hours: 8,
        total: 1600
      });
    });

    it('should update on hours change (debounced)', () => {
      const container = calculator.render();
      const hoursInput = container.querySelector('#calc-hours');

      hoursInput.value = '10';
      hoursInput.dispatchEvent(new Event('input'));

      vi.advanceTimersByTime(300);

      expect(mockOnCalculate).toHaveBeenCalledWith({
        rate: 150,
        hours: 10,
        total: 1500
      });
    });

    it('should debounce rapid input changes', () => {
      const container = calculator.render();
      const rateInput = container.querySelector('#calc-rate');

      // Rapid changes
      rateInput.value = '100';
      rateInput.dispatchEvent(new Event('input'));

      vi.advanceTimersByTime(100);

      rateInput.value = '200';
      rateInput.dispatchEvent(new Event('input'));

      vi.advanceTimersByTime(100);

      rateInput.value = '300';
      rateInput.dispatchEvent(new Event('input'));

      vi.advanceTimersByTime(300);

      // Should only call once with final value
      expect(mockOnCalculate).toHaveBeenCalledTimes(1);
      expect(mockOnCalculate).toHaveBeenCalledWith(
        expect.objectContaining({ rate: 300 })
      );
    });

    it('should update result display on change', () => {
      const container = calculator.render();
      const rateInput = container.querySelector('#calc-rate');
      const result = container.querySelector('.calculator-result-value');

      rateInput.value = '200';
      rateInput.dispatchEvent(new Event('input'));

      vi.advanceTimersByTime(300);

      expect(result.textContent).toBe('$1600.00'); // 200 * 8
    });

    it('should reject negative values', () => {
      const container = calculator.render();
      const rateInput = container.querySelector('#calc-rate');

      rateInput.value = '-100';
      rateInput.dispatchEvent(new Event('input'));

      vi.advanceTimersByTime(300);

      // Should not update or call callback for negative values
      expect(mockOnCalculate).not.toHaveBeenCalled();
    });
  });

  describe('getValue', () => {
    it('should return current values', () => {
      calculator.rate = 175;
      calculator.hours = 6;

      const value = calculator.getValue();

      expect(value).toEqual({
        rate: 175,
        hours: 6,
        total: 1050
      });
    });
  });

  describe('setValue', () => {
    it('should update rate and hours', () => {
      calculator.render();

      calculator.setValue(200, 10);

      expect(calculator.rate).toBe(200);
      expect(calculator.hours).toBe(10);
    });

    it('should update input fields if rendered', () => {
      const container = calculator.render();

      calculator.setValue(250, 12);

      expect(container.querySelector('#calc-rate').value).toBe('250');
      expect(container.querySelector('#calc-hours').value).toBe('12');
    });

    it('should update result display', () => {
      const container = calculator.render();

      calculator.setValue(100, 5);

      const result = container.querySelector('.calculator-result-value');
      expect(result.textContent).toBe('$500.00');
    });
  });

  describe('destroy', () => {
    it('should remove widget from DOM', () => {
      const container = calculator.render();
      document.body.appendChild(container);

      calculator.destroy();

      expect(document.body.contains(container)).toBe(false);
      expect(calculator.container).toBeNull();
    });

    it('should handle destroy when not in DOM', () => {
      calculator.render();

      expect(() => calculator.destroy()).not.toThrow();
    });
  });
});
