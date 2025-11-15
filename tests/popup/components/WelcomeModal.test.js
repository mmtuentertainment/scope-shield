// T062-T063: WelcomeModal Test Coverage

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WelcomeModal } from '../../../src/popup/WelcomeModal.js';
import { FirstRunDetector } from '../../../src/lib/utils/FirstRunDetector.js';
import { sanitizeText } from '../../../src/lib/utils/Sanitizer.js';
import { logError } from '../../../src/lib/utils/Logger.js';

// Mock dependencies
vi.mock('../../../src/lib/utils/FirstRunDetector.js', () => ({
  FirstRunDetector: {
    completeFirstRun: vi.fn().mockResolvedValue(undefined)
  }
}));

vi.mock('../../../src/lib/utils/Sanitizer.js', () => ({
  sanitizeText: vi.fn((text) => text)
}));

vi.mock('../../../src/lib/utils/Logger.js', () => ({
  logError: vi.fn()
}));

describe('WelcomeModal', () => {
  let modal;

  beforeEach(() => {
    modal = new WelcomeModal();
    document.body.innerHTML = ''; // Clean slate
    vi.useFakeTimers(); // For timeout tests
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  describe('Modal Lifecycle', () => {
    it('show() creates modal on first call', async () => {
      const showPromise = modal.show();

      // Modal should be created
      expect(modal.modal).toBeTruthy();
      expect(document.body.querySelector('.welcome-modal-overlay')).toBeTruthy();

      // Should have form elements
      expect(document.querySelector('#welcome-form')).toBeTruthy();
      expect(document.querySelector('#welcome-name')).toBeTruthy();

      // Submit form to resolve promise
      const form = document.querySelector('#welcome-form');
      const nameInput = document.querySelector('#welcome-name');
      nameInput.value = 'John Doe';

      form.dispatchEvent(new Event('submit'));
      await vi.runAllTimersAsync();

      await expect(showPromise).resolves.toBeUndefined();
    });

    it('show() returns resolved promise on duplicate calls', async () => {
      // First call
      const firstPromise = modal.show();

      // Second call while modal exists
      const secondPromise = modal.show();

      // Second promise should resolve immediately
      await expect(secondPromise).resolves.toBeUndefined();

      // Cleanup first promise
      const nameInput = document.querySelector('#welcome-name');
      nameInput.value = 'John Doe';
      document.querySelector('#welcome-form').dispatchEvent(new Event('submit'));
      await vi.runAllTimersAsync();
      await firstPromise;
    });

    it('show() rejects and cleans up if form element missing (MAJOR bug test)', async () => {
      // Mock getModalTemplate to return HTML without form
      vi.spyOn(modal, 'getModalTemplate').mockReturnValue('<div class="welcome-modal">No form here</div>');

      const showPromise = modal.show();

      // Promise should reject
      await expect(showPromise).rejects.toThrow('Form element #welcome-form not found in modal template');

      // Modal should be cleaned up
      expect(modal.modal).toBeNull();
      expect(document.body.querySelector('.welcome-modal-overlay')).toBeNull();

      // Error should be logged
      expect(logError).toHaveBeenCalledWith(
        'WelcomeModal.setupEventListeners: Form element #welcome-form not found',
        expect.any(Error)
      );
    });

    it('close() removes modal and clears timeouts', () => {
      modal.show();

      // Add a timeout to track
      const timeoutId = setTimeout(() => {}, 1000);
      modal.timeouts.push(timeoutId);

      // Close modal
      modal.close();

      // Should clear old timeouts and add fade-out timeout
      expect(modal.timeouts.length).toBe(1); // Only fade-out timeout remains

      // Should add fade-out class
      expect(modal.modal.classList.contains('fade-out')).toBe(true);

      // Advance timers to complete removal
      vi.advanceTimersByTime(300);

      // Modal should be removed
      expect(modal.modal).toBeNull();
    });

    it('close() handles already closed modal gracefully', () => {
      // Close without opening
      expect(() => modal.close()).not.toThrow();
      expect(modal.modal).toBeNull();
    });
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      modal.show();
    });

    it('handleSubmit() saves freelancer name and resolves promise', async () => {
      const nameInput = document.querySelector('#welcome-name');
      nameInput.value = 'Jane Doe';

      const resolveCallback = vi.fn();
      await modal.handleSubmit(resolveCallback);

      // Should sanitize name
      expect(sanitizeText).toHaveBeenCalledWith('Jane Doe', 100);

      // Should save via FirstRunDetector
      expect(FirstRunDetector.completeFirstRun).toHaveBeenCalledWith('Jane Doe');

      // Should resolve promise
      await vi.runAllTimersAsync();
      expect(resolveCallback).toHaveBeenCalled();
    });

    it('handleSubmit() validates name is not empty', async () => {
      const nameInput = document.querySelector('#welcome-name');
      nameInput.value = '';

      const resolveCallback = vi.fn();
      await modal.handleSubmit(resolveCallback);

      // Should show error
      const errorEl = document.querySelector('#welcome-error');
      expect(errorEl.textContent).toBe('Please enter your name');
      expect(errorEl.style.display).toBe('block');

      // Should not save
      expect(FirstRunDetector.completeFirstRun).not.toHaveBeenCalled();

      // Should not resolve
      expect(resolveCallback).not.toHaveBeenCalled();
    });

    it('handleSubmit() shows error for whitespace-only name', async () => {
      const nameInput = document.querySelector('#welcome-name');

      // Mock sanitizeText to return whitespace
      sanitizeText.mockReturnValueOnce('   ');
      nameInput.value = '   ';

      const resolveCallback = vi.fn();
      await modal.handleSubmit(resolveCallback);

      // Should show error
      const errorEl = document.querySelector('#welcome-error');
      expect(errorEl.textContent).toBe('Please enter your name');

      // Should not save
      expect(FirstRunDetector.completeFirstRun).not.toHaveBeenCalled();
    });

    it('handleSubmit() handles FirstRunDetector.completeFirstRun() errors', async () => {
      const nameInput = document.querySelector('#welcome-name');
      const submitBtn = document.querySelector('button[type="submit"]');

      nameInput.value = 'John Doe';

      // Mock save to fail
      FirstRunDetector.completeFirstRun.mockRejectedValueOnce(new Error('Storage error'));

      const resolveCallback = vi.fn();
      await modal.handleSubmit(resolveCallback);

      // Should log error
      expect(logError).toHaveBeenCalledWith(
        'WelcomeModal.handleSubmit: Error saving name',
        expect.any(Error)
      );

      // Should show user-friendly error
      const errorEl = document.querySelector('#welcome-error');
      expect(errorEl.textContent).toBe('Failed to save. Please try again.');

      // Should not resolve
      expect(resolveCallback).not.toHaveBeenCalled();

      // Button should be reset
      expect(submitBtn.textContent).toBe('Get Started');
      expect(submitBtn.disabled).toBe(false);
    });

    it('handleSubmit() resets button state on error', async () => {
      const nameInput = document.querySelector('#welcome-name');
      const submitBtn = document.querySelector('button[type="submit"]');

      nameInput.value = 'Test User';

      // Mock save to fail
      FirstRunDetector.completeFirstRun.mockRejectedValueOnce(new Error('Failed'));

      await modal.handleSubmit(vi.fn());

      // Button should be reset
      expect(submitBtn.textContent).toBe('Get Started');
      expect(submitBtn.disabled).toBe(false);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      modal.show();
    });

    it('showError() displays error message', () => {
      modal.showError('Test error message');

      const errorEl = document.querySelector('#welcome-error');
      expect(errorEl.textContent).toBe('Test error message');
      expect(errorEl.style.display).toBe('block');
    });

    it('showError() auto-hides after 3 seconds', () => {
      modal.showError('Temporary error');

      const errorEl = document.querySelector('#welcome-error');
      expect(errorEl.style.display).toBe('block');

      // Advance time
      vi.advanceTimersByTime(3000);

      // Should be hidden
      expect(errorEl.style.display).toBe('none');
    });

    it('showError() tracks timeout for cleanup', () => {
      const initialTimeouts = modal.timeouts.length;

      modal.showError('Test error');

      // Should add timeout to tracking array
      expect(modal.timeouts.length).toBe(initialTimeouts + 1);
    });
  });

  describe('User Interactions', () => {
    beforeEach(() => {
      modal.show();
    });

    it('shake() adds animation class and removes after 500ms', () => {
      const modalContent = document.querySelector('.welcome-modal');

      modal.shake();

      // Should add shake class
      expect(modalContent.classList.contains('shake')).toBe(true);

      // Advance time
      vi.advanceTimersByTime(500);

      // Should remove shake class
      expect(modalContent.classList.contains('shake')).toBe(false);
    });

    it('modal overlay click triggers shake (does not close)', () => {
      const shakeSpy = vi.spyOn(modal, 'shake');
      const overlay = document.querySelector('.welcome-modal-overlay');

      // Click on overlay (not modal content)
      overlay.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      // Should shake
      expect(shakeSpy).toHaveBeenCalled();

      // Modal should still exist
      expect(modal.modal).toBeTruthy();
    });

    it('modal content click does not trigger shake', () => {
      const shakeSpy = vi.spyOn(modal, 'shake');
      const modalContent = document.querySelector('.welcome-modal');

      // Click on modal content
      modalContent.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      // Should not shake
      expect(shakeSpy).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('multiple show() calls do not create duplicate modals', () => {
      modal.show();
      modal.show();
      modal.show();

      // Should only have one modal in DOM
      const modals = document.querySelectorAll('.welcome-modal-overlay');
      expect(modals.length).toBe(1);
    });

    it('handleSubmit() handles missing submit button on error path', async () => {
      modal.show();

      const nameInput = document.querySelector('#welcome-name');
      nameInput.value = 'Test User';

      // Mock save to fail
      FirstRunDetector.completeFirstRun.mockRejectedValueOnce(new Error('Failed'));

      // Remove submit button after setup but before error
      const submitBtn = document.querySelector('button[type="submit"]');
      submitBtn.remove();

      // Should throw when trying to reset button in error handler
      // NOTE: This documents a bug - error handler should check if button exists
      await expect(modal.handleSubmit(vi.fn())).rejects.toThrow();
    });

    it('timeout cleanup prevents memory leaks', () => {
      modal.show();

      // Trigger multiple timeouts
      modal.showError('Error 1');
      modal.shake();
      modal.showError('Error 2');

      // Should have tracked timeouts (3 errors/shakes + initial show)
      const timeoutCountBeforeClose = modal.timeouts.length;
      expect(timeoutCountBeforeClose).toBeGreaterThan(0);

      // Close modal
      modal.close();

      // Should clear old timeouts and add fade-out timeout
      expect(modal.timeouts.length).toBe(1); // Only fade-out remains

      // Advance timers to complete fade-out
      vi.advanceTimersByTime(300);

      // Modal should be removed
      expect(modal.modal).toBeNull();
    });

    it('shake() handles missing modal gracefully', () => {
      // Don't create modal
      expect(() => modal.shake()).not.toThrow();
    });
  });
});
