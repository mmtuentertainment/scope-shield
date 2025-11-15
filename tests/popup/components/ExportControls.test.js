// ExportControls Tests

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ExportControls } from '../../../src/popup/components/ExportControls.js';
import { ExportService } from '../../../src/lib/change-order/export/ExportService.js';
import * as NotificationManager from '../../../src/popup/components/NotificationManager.js';

vi.mock('../../../src/lib/change-order/export/ExportService.js');
vi.mock('../../../src/popup/components/NotificationManager.js', () => ({
  showNotification: vi.fn()
}));

describe('ExportControls', () => {
  let exportControls;
  let mockChangeOrderText;
  let mockMetadata;

  beforeEach(() => {
    mockChangeOrderText = 'CHANGE ORDER REQUEST\n\nClient: Acme Corp\nChanges requested.';
    mockMetadata = {
      clientName: 'Acme Corp',
      freelancerName: 'Jane Doe',
      date: '2025-11-15'
    };

    // Mock ExportService methods
    ExportService.copyToClipboard = vi.fn().mockResolvedValue({ success: true });
    ExportService.exportAsPDF = vi.fn().mockResolvedValue({ success: true });
    ExportService.downloadAsText = vi.fn().mockReturnValue({ success: true });

    exportControls = new ExportControls(mockChangeOrderText, mockMetadata);

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('render', () => {
    it('should create export controls container', () => {
      const container = exportControls.render();

      expect(container).toBeInstanceOf(HTMLElement);
      expect(container.className).toBe('export-controls');
    });

    it('should render header', () => {
      const container = exportControls.render();
      const header = container.querySelector('h3');

      expect(header).toBeTruthy();
      expect(header.textContent).toBe('Export Change Order');
    });

    it('should render 3 export buttons', () => {
      const container = exportControls.render();
      const buttons = container.querySelectorAll('.export-btn');

      expect(buttons.length).toBe(3);
    });

    it('should render clipboard button', () => {
      const container = exportControls.render();
      const button = container.querySelector('.clipboard-btn');

      expect(button).toBeTruthy();
      expect(button.textContent).toContain('Copy to Clipboard');
    });

    it('should render PDF button', () => {
      const container = exportControls.render();
      const button = container.querySelector('.pdf-btn');

      expect(button).toBeTruthy();
      expect(button.textContent).toContain('Export as PDF');
    });

    it('should render Text button', () => {
      const container = exportControls.render();
      const button = container.querySelector('.text-btn');

      expect(button).toBeTruthy();
      expect(button.textContent).toContain('Download as Text');
    });
  });

  describe('clipboard export', () => {
    it('should handle successful clipboard export', async () => {
      const container = exportControls.render();
      const button = container.querySelector('.clipboard-btn');

      button.click();
      await vi.runAllTimersAsync();

      expect(ExportService.copyToClipboard).toHaveBeenCalledWith(mockChangeOrderText);
      expect(NotificationManager.showNotification).toHaveBeenCalledWith(
        expect.stringContaining('Copied to clipboard'),
        'success'
      );
    });

    it('should handle clipboard export error', async () => {
      ExportService.copyToClipboard.mockResolvedValue({
        success: false,
        error: 'Permission denied'
      });

      const container = exportControls.render();
      const button = container.querySelector('.clipboard-btn');

      button.click();
      await vi.runAllTimersAsync();

      expect(NotificationManager.showNotification).toHaveBeenCalledWith(
        expect.stringContaining('Permission denied'),
        'error'
      );
    });

    it('should show fallback suggestion on error', async () => {
      ExportService.copyToClipboard.mockResolvedValue({
        success: false,
        error: 'Clipboard denied',
        fallbackSuggestion: 'Use Download as Text'
      });

      const container = exportControls.render();
      const button = container.querySelector('.clipboard-btn');

      button.click();
      await vi.runAllTimersAsync();

      vi.advanceTimersByTime(2000);
      await vi.runAllTimersAsync();

      expect(NotificationManager.showNotification).toHaveBeenCalledWith(
        expect.stringContaining('Use Download as Text'),
        'info'
      );
    });

    it('should disable button during export', async () => {
      const container = exportControls.render();
      const button = container.querySelector('.clipboard-btn');

      button.click();

      expect(button.disabled).toBe(true);
      expect(button.textContent).toContain('Exporting');

      await vi.runAllTimersAsync();

      expect(button.disabled).toBe(false);
    });
  });

  describe('PDF export', () => {
    it('should handle successful PDF export', async () => {
      const container = exportControls.render();
      const button = container.querySelector('.pdf-btn');

      button.click();
      await vi.runAllTimersAsync();

      expect(ExportService.exportAsPDF).toHaveBeenCalledWith(
        mockChangeOrderText,
        mockMetadata
      );
      expect(NotificationManager.showNotification).toHaveBeenCalledWith(
        expect.stringContaining('PDF downloaded'),
        'success'
      );
    });

    it('should handle PDF export error with fallback', async () => {
      ExportService.exportAsPDF.mockResolvedValue({
        success: false,
        error: 'jsPDF failed',
        fallbackSuggestion: 'Try Download as Text'
      });

      const container = exportControls.render();
      const button = container.querySelector('.pdf-btn');

      button.click();
      await vi.runAllTimersAsync();

      vi.advanceTimersByTime(2000);
      await vi.runAllTimersAsync();

      expect(NotificationManager.showNotification).toHaveBeenCalledWith(
        expect.stringContaining('Try Download as Text'),
        'info'
      );
    });

    it('should call highlightFallback on PDF error with suggestion', async () => {
      ExportService.exportAsPDF.mockResolvedValue({
        success: false,
        error: 'PDF failed',
        fallbackSuggestion: 'Use text'
      });

      const container = exportControls.render();
      const pdfButton = container.querySelector('.pdf-btn');

      // Spy on highlightFallback method
      const highlightSpy = vi.spyOn(exportControls, 'highlightFallback');

      pdfButton.click();
      await vi.runAllTimersAsync();

      // Advance past the 2s delay
      vi.advanceTimersByTime(2100);
      await vi.runAllTimersAsync();

      // highlightFallback should have been called with 'text'
      expect(highlightSpy).toHaveBeenCalledWith('text');
    });
  });

  describe('text export', () => {
    it('should handle successful text export', async () => {
      const container = exportControls.render();
      const button = container.querySelector('.text-btn');

      button.click();
      await vi.runAllTimersAsync();

      expect(ExportService.downloadAsText).toHaveBeenCalledWith(
        mockChangeOrderText,
        mockMetadata
      );
      expect(NotificationManager.showNotification).toHaveBeenCalledWith(
        expect.stringContaining('Text file downloaded'),
        'success'
      );
    });

    it('should handle text export error', async () => {
      ExportService.downloadAsText.mockReturnValue({
        success: false,
        error: 'Download blocked'
      });

      const container = exportControls.render();
      const button = container.querySelector('.text-btn');

      button.click();
      await vi.runAllTimersAsync();

      expect(NotificationManager.showNotification).toHaveBeenCalledWith(
        expect.stringContaining('Download blocked'),
        'error'
      );
    });
  });

  describe('loading states', () => {
    it('should prevent multiple simultaneous exports', async () => {
      const container = exportControls.render();
      const button = container.querySelector('.clipboard-btn');

      button.click();
      button.click(); // Second click while first is in progress

      await vi.runAllTimersAsync();

      // Should only call once
      expect(ExportService.copyToClipboard).toHaveBeenCalledTimes(1);
    });

    it('should disable all buttons during export', async () => {
      const container = exportControls.render();
      const clipboardBtn = container.querySelector('.clipboard-btn');
      const pdfBtn = container.querySelector('.pdf-btn');
      const textBtn = container.querySelector('.text-btn');

      clipboardBtn.click();

      expect(clipboardBtn.disabled).toBe(true);
      expect(pdfBtn.disabled).toBe(true);
      expect(textBtn.disabled).toBe(true);

      await vi.runAllTimersAsync();

      expect(clipboardBtn.disabled).toBe(false);
      expect(pdfBtn.disabled).toBe(false);
      expect(textBtn.disabled).toBe(false);
    });
  });

  describe('destroy', () => {
    it('should remove component from DOM', () => {
      const container = exportControls.render();
      document.body.appendChild(container);

      exportControls.destroy();

      expect(document.body.contains(container)).toBe(false);
      expect(exportControls.container).toBeNull();
    });

    it('should handle destroy when not in DOM', () => {
      exportControls.render();

      expect(() => exportControls.destroy()).not.toThrow();
    });
  });
});
