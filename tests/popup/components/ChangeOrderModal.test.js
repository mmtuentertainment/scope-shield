// ChangeOrderModal Tests

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ChangeOrderModal } from '../../../src/popup/components/ChangeOrderModal.js';
import { PricingCalculatorWidget } from '../../../src/lib/change-order/PricingCalculatorWidget.js';
import { ExportControls } from '../../../src/popup/components/ExportControls.js';

vi.mock('../../../src/lib/change-order/PricingCalculatorWidget.js');
vi.mock('../../../src/popup/components/ExportControls.js');

describe('ChangeOrderModal', () => {
  let modal;
  let mockChangeOrderText;
  let mockMetadata;
  let mockCalculatorOptions;
  let mockCalculatorInstance;
  let mockExportControlsInstance;

  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = '';

    mockChangeOrderText = 'CHANGE ORDER REQUEST\n\nClient: Acme Corp\nTotal: $400';
    mockMetadata = {
      clientName: 'Acme Corp',
      freelancerName: 'Jane Doe',
      date: '2025-11-15'
    };
    mockCalculatorOptions = {
      hourlyRate: 100,
      estimatedHours: 4,
      onRecalculate: vi.fn().mockResolvedValue('UPDATED CHANGE ORDER')
    };

    // Mock calculator instance
    mockCalculatorInstance = {
      render: vi.fn().mockReturnValue(document.createElement('div')),
      destroy: vi.fn()
    };
    PricingCalculatorWidget.mockImplementation(() => mockCalculatorInstance);

    // Mock export controls instance
    mockExportControlsInstance = {
      render: vi.fn().mockReturnValue(document.createElement('div')),
      destroy: vi.fn()
    };
    ExportControls.mockImplementation(() => mockExportControlsInstance);

    vi.useFakeTimers();
  });

  afterEach(() => {
    // Cleanup modals
    if (modal) {
      modal.close();
      modal = null;
    }

    vi.clearAllMocks();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('constructor', () => {
    it('should create modal instance with required parameters', () => {
      modal = new ChangeOrderModal(mockChangeOrderText, mockMetadata, mockCalculatorOptions);

      expect(modal.changeOrderText).toBe(mockChangeOrderText);
      expect(modal.metadata).toBe(mockMetadata);
      expect(modal.calculatorOptions).toBe(mockCalculatorOptions);
    });

    it('should handle empty calculator options', () => {
      modal = new ChangeOrderModal(mockChangeOrderText, mockMetadata);

      expect(modal.calculatorOptions).toEqual({});
    });
  });

  describe('show', () => {
    it('should add modal to DOM', () => {
      modal = new ChangeOrderModal(mockChangeOrderText, mockMetadata, mockCalculatorOptions);
      modal.show();

      const overlay = document.querySelector('.change-order-modal-overlay');
      expect(overlay).toBeTruthy();
      expect(overlay.parentNode).toBe(document.body);
    });

    it('should create modal structure with header and body', () => {
      modal = new ChangeOrderModal(mockChangeOrderText, mockMetadata, mockCalculatorOptions);
      modal.show();

      const modalEl = document.querySelector('.change-order-modal');
      const header = modalEl.querySelector('.modal-header');
      const body = modalEl.querySelector('.modal-body');

      expect(header).toBeTruthy();
      expect(body).toBeTruthy();
    });

    it('should render title in header', () => {
      modal = new ChangeOrderModal(mockChangeOrderText, mockMetadata, mockCalculatorOptions);
      modal.show();

      const title = document.querySelector('.modal-header h2');
      expect(title.textContent).toBe('Change Order Request');
    });

    it('should render close button in header', () => {
      modal = new ChangeOrderModal(mockChangeOrderText, mockMetadata, mockCalculatorOptions);
      modal.show();

      const closeBtn = document.querySelector('.close-btn');
      expect(closeBtn).toBeTruthy();
      expect(closeBtn.textContent).toBe('×');
      expect(closeBtn.getAttribute('aria-label')).toBe('Close modal');
    });

    it('should display document preview', () => {
      modal = new ChangeOrderModal(mockChangeOrderText, mockMetadata, mockCalculatorOptions);
      modal.show();

      const preview = document.querySelector('.document-preview');
      expect(preview).toBeTruthy();
      expect(preview.textContent).toBe(mockChangeOrderText);
    });

    it('should mount calculator widget', () => {
      modal = new ChangeOrderModal(mockChangeOrderText, mockMetadata, mockCalculatorOptions);
      modal.show();

      expect(PricingCalculatorWidget).toHaveBeenCalledWith(
        expect.objectContaining({
          initialRate: 100,
          initialHours: 4
        })
      );
      expect(mockCalculatorInstance.render).toHaveBeenCalled();

      const container = document.querySelector('.calculator-container');
      expect(container).toBeTruthy();
    });

    it('should mount export controls', () => {
      modal = new ChangeOrderModal(mockChangeOrderText, mockMetadata, mockCalculatorOptions);
      modal.show();

      expect(ExportControls).toHaveBeenCalledWith(
        mockChangeOrderText,
        expect.objectContaining({
          clientName: 'Acme Corp',
          freelancerName: 'Jane Doe',
          date: '2025-11-15'
        })
      );
      expect(mockExportControlsInstance.render).toHaveBeenCalled();

      const container = document.querySelector('.export-container');
      expect(container).toBeTruthy();
    });

    it('should add escape key listener', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      modal = new ChangeOrderModal(mockChangeOrderText, mockMetadata, mockCalculatorOptions);
      modal.show();

      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
  });

  describe('close', () => {
    it('should remove modal from DOM', () => {
      modal = new ChangeOrderModal(mockChangeOrderText, mockMetadata, mockCalculatorOptions);
      modal.show();

      modal.close();

      const overlay = document.querySelector('.change-order-modal-overlay');
      expect(overlay).toBeFalsy();
    });

    it('should cleanup calculator instance', () => {
      modal = new ChangeOrderModal(mockChangeOrderText, mockMetadata, mockCalculatorOptions);
      modal.show();
      modal.close();

      expect(mockCalculatorInstance.destroy).toHaveBeenCalled();
    });

    it('should cleanup export controls instance', () => {
      modal = new ChangeOrderModal(mockChangeOrderText, mockMetadata, mockCalculatorOptions);
      modal.show();
      modal.close();

      expect(mockExportControlsInstance.destroy).toHaveBeenCalled();
    });

    it('should remove escape key listener', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
      modal = new ChangeOrderModal(mockChangeOrderText, mockMetadata, mockCalculatorOptions);
      modal.show();
      modal.close();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('should handle close when not shown', () => {
      modal = new ChangeOrderModal(mockChangeOrderText, mockMetadata, mockCalculatorOptions);

      expect(() => modal.close()).not.toThrow();
    });
  });

  describe('updateDocument', () => {
    it('should update document preview text', () => {
      modal = new ChangeOrderModal(mockChangeOrderText, mockMetadata, mockCalculatorOptions);
      modal.show();

      const newText = 'UPDATED CHANGE ORDER\n\nNew total: $500';
      modal.updateDocument(newText);

      const preview = document.querySelector('.document-preview');
      expect(preview.textContent).toBe(newText);
    });

    it('should recreate export controls with new text', () => {
      modal = new ChangeOrderModal(mockChangeOrderText, mockMetadata, mockCalculatorOptions);
      modal.show();

      vi.clearAllMocks();

      const newText = 'UPDATED CHANGE ORDER';
      modal.updateDocument(newText);

      // Should destroy old instance
      expect(mockExportControlsInstance.destroy).toHaveBeenCalled();

      // Should create new instance with updated text
      expect(ExportControls).toHaveBeenCalledWith(
        newText,
        expect.any(Object)
      );
    });
  });

  describe('calculator integration', () => {
    it('should call onRecalculate when calculator changes (debounced)', async () => {
      modal = new ChangeOrderModal(mockChangeOrderText, mockMetadata, mockCalculatorOptions);
      modal.show();

      // Get onCalculate callback
      const onCalculateCallback = PricingCalculatorWidget.mock.calls[0][0].onCalculate;

      // Simulate calculator change
      onCalculateCallback({ rate: 120, hours: 5 });

      // Should not call immediately (debounced)
      expect(mockCalculatorOptions.onRecalculate).not.toHaveBeenCalled();

      // Advance timers past debounce delay (300ms)
      await vi.advanceTimersByTimeAsync(300);

      // Should call with new values
      expect(mockCalculatorOptions.onRecalculate).toHaveBeenCalledWith(120, 5);
    });

    it('should update document after recalculation', async () => {
      modal = new ChangeOrderModal(mockChangeOrderText, mockMetadata, mockCalculatorOptions);
      modal.show();

      const onCalculateCallback = PricingCalculatorWidget.mock.calls[0][0].onCalculate;

      onCalculateCallback({ rate: 120, hours: 5 });
      await vi.advanceTimersByTimeAsync(300);

      // Should update preview with new document
      const preview = document.querySelector('.document-preview');
      expect(preview.textContent).toBe('UPDATED CHANGE ORDER');
    });

    it('should handle recalculation errors gracefully', async () => {
      mockCalculatorOptions.onRecalculate = vi.fn().mockRejectedValue(new Error('Recalc failed'));
      modal = new ChangeOrderModal(mockChangeOrderText, mockMetadata, mockCalculatorOptions);
      modal.show();

      const onCalculateCallback = PricingCalculatorWidget.mock.calls[0][0].onCalculate;

      onCalculateCallback({ rate: 120, hours: 5 });
      await vi.advanceTimersByTimeAsync(300);

      // Should not throw, should log error
      const preview = document.querySelector('.document-preview');
      expect(preview.textContent).toBe(mockChangeOrderText); // Unchanged
    });

    it('should handle missing onRecalculate callback', async () => {
      const optionsWithoutCallback = {
        hourlyRate: 100,
        estimatedHours: 4
        // No onRecalculate
      };
      modal = new ChangeOrderModal(mockChangeOrderText, mockMetadata, optionsWithoutCallback);
      modal.show();

      const onCalculateCallback = PricingCalculatorWidget.mock.calls[0][0].onCalculate;

      expect(() => {
        onCalculateCallback({ rate: 120, hours: 5 });
      }).not.toThrow();
    });
  });

  describe('keyboard shortcuts', () => {
    it('should close on Escape key', () => {
      modal = new ChangeOrderModal(mockChangeOrderText, mockMetadata, mockCalculatorOptions);
      modal.show();

      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(escapeEvent);

      const overlay = document.querySelector('.change-order-modal-overlay');
      expect(overlay).toBeFalsy();
    });

    it('should not close on other keys', () => {
      modal = new ChangeOrderModal(mockChangeOrderText, mockMetadata, mockCalculatorOptions);
      modal.show();

      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      document.dispatchEvent(enterEvent);

      const overlay = document.querySelector('.change-order-modal-overlay');
      expect(overlay).toBeTruthy();
    });
  });

  describe('close button', () => {
    it('should close modal when close button clicked', () => {
      modal = new ChangeOrderModal(mockChangeOrderText, mockMetadata, mockCalculatorOptions);
      modal.show();

      const closeBtn = document.querySelector('.close-btn');
      closeBtn.click();

      const overlay = document.querySelector('.change-order-modal-overlay');
      expect(overlay).toBeFalsy();
    });
  });
});
