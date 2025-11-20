/**
 * ManualChangeOrderButton Tests
 * Comprehensive test coverage for manual change order creation button
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ManualChangeOrderButton } from '../../../src/popup/components/ManualChangeOrderButton.js';

describe('ManualChangeOrderButton', () => {
  let mockOnCreateManual;

  beforeEach(() => {
    mockOnCreateManual = vi.fn();
  });

  describe('constructor', () => {
    it('should create button with required callback', () => {
      const button = new ManualChangeOrderButton({
        onCreateManual: mockOnCreateManual
      });

      expect(button.onCreateManual).toBe(mockOnCreateManual);
    });

    it('should throw TypeError if onCreateManual is missing', () => {
      expect(() => {
        new ManualChangeOrderButton({});
      }).toThrow(TypeError);
    });

    it('should throw TypeError if onCreateManual is not a function', () => {
      expect(() => {
        new ManualChangeOrderButton({ onCreateManual: 'not-a-function' });
      }).toThrow(TypeError);
    });
  });

  describe('render', () => {
    it('should create button container with button element', () => {
      const button = new ManualChangeOrderButton({
        onCreateManual: mockOnCreateManual
      });

      const container = button.render();

      expect(container.className).toBe('manual-change-order-container');
      expect(container.querySelector('button')).toBeTruthy();
    });

    it('should create button with correct text', () => {
      const button = new ManualChangeOrderButton({
        onCreateManual: mockOnCreateManual
      });

      const container = button.render();
      const btnElement = container.querySelector('button');

      expect(btnElement.textContent).toBe('Create Manual Change Order');
      expect(btnElement.id).toBe('manual-change-order-btn');
    });

    it('should create explanatory text', () => {
      const button = new ManualChangeOrderButton({
        onCreateManual: mockOnCreateManual
      });

      const container = button.render();
      const explanation = container.querySelector('.manual-change-order-explanation');

      expect(explanation).toBeTruthy();
      expect(explanation.textContent).toContain('No scope creep detected');
    });
  });

  describe('handleClick', () => {
    it('should call onCreateManual callback when clicked', async () => {
      mockOnCreateManual.mockResolvedValue();

      const button = new ManualChangeOrderButton({
        onCreateManual: mockOnCreateManual
      });

      const container = button.render();
      const btnElement = container.querySelector('button');

      btnElement.click();

      // Wait for async handling
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockOnCreateManual).toHaveBeenCalledTimes(1);
    });

    it('should disable button during creation', async () => {
      mockOnCreateManual.mockImplementation(() => {
        return new Promise(resolve => setTimeout(resolve, 100));
      });

      const button = new ManualChangeOrderButton({
        onCreateManual: mockOnCreateManual
      });

      const container = button.render();
      const btnElement = container.querySelector('button');

      btnElement.click();

      expect(btnElement.disabled).toBe(true);
      expect(btnElement.textContent).toBe('Creating...');

      // Wait for promise to resolve
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(btnElement.disabled).toBe(false);
      expect(btnElement.textContent).toBe('Create Manual Change Order');
    });

    it('should restore button state after successful creation', async () => {
      mockOnCreateManual.mockResolvedValue();

      const button = new ManualChangeOrderButton({
        onCreateManual: mockOnCreateManual
      });

      const container = button.render();
      const btnElement = container.querySelector('button');

      btnElement.click();

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(btnElement.disabled).toBe(false);
      expect(btnElement.textContent).toBe('Create Manual Change Order');
    });

    it('should restore button state after error', async () => {
      mockOnCreateManual.mockRejectedValue(new Error('Creation failed'));

      const button = new ManualChangeOrderButton({
        onCreateManual: mockOnCreateManual
      });

      const container = button.render();
      const btnElement = container.querySelector('button');

      btnElement.click();

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(btnElement.disabled).toBe(false);
      expect(btnElement.textContent).toBe('Create Manual Change Order');
    });

    it('should prevent double-click', async () => {
      mockOnCreateManual.mockImplementation(() => {
        return new Promise(resolve => setTimeout(resolve, 100));
      });

      const button = new ManualChangeOrderButton({
        onCreateManual: mockOnCreateManual
      });

      const container = button.render();
      const btnElement = container.querySelector('button');

      btnElement.click();
      btnElement.click(); // Second click while disabled

      await new Promise(resolve => setTimeout(resolve, 150));

      // Should only be called once
      expect(mockOnCreateManual).toHaveBeenCalledTimes(1);
    });
  });

  describe('show', () => {
    it('should display the container', () => {
      const button = new ManualChangeOrderButton({
        onCreateManual: mockOnCreateManual
      });

      const container = button.render();
      container.style.display = 'none';

      button.show();

      expect(container.style.display).toBe('block');
    });
  });

  describe('hide', () => {
    it('should hide the container', () => {
      const button = new ManualChangeOrderButton({
        onCreateManual: mockOnCreateManual
      });

      const container = button.render();

      button.hide();

      expect(container.style.display).toBe('none');
    });
  });

  describe('isVisible', () => {
    it('should return true when container is visible', () => {
      const button = new ManualChangeOrderButton({
        onCreateManual: mockOnCreateManual
      });

      button.render();
      button.show();

      expect(button.isVisible()).toBe(true);
    });

    it('should return false when container is hidden', () => {
      const button = new ManualChangeOrderButton({
        onCreateManual: mockOnCreateManual
      });

      button.render();
      button.hide();

      expect(button.isVisible()).toBe(false);
    });
  });

  describe('destroy', () => {
    it('should remove container from DOM', () => {
      const button = new ManualChangeOrderButton({
        onCreateManual: mockOnCreateManual
      });

      const container = button.render();
      document.body.appendChild(container);

      button.destroy();

      expect(document.body.contains(container)).toBe(false);
      expect(button.container).toBeNull();
      expect(button.button).toBeNull();
    });

    it('should remove event listeners', () => {
      const button = new ManualChangeOrderButton({
        onCreateManual: mockOnCreateManual
      });

      const container = button.render();
      const btnElement = container.querySelector('button');
      button.destroy();

      // Click after destroy should not call callback
      btnElement.click();

      expect(mockOnCreateManual).not.toHaveBeenCalled();
    });
  });
});
