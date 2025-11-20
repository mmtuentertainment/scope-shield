/**
 * InlineFieldEditor Tests
 * Comprehensive test coverage for inline field editing functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InlineFieldEditor } from '../../../src/popup/components/InlineFieldEditor.js';

describe('InlineFieldEditor', () => {
  let mockOnSave;
  let mockOnEdit;

  beforeEach(() => {
    mockOnSave = vi.fn();
    mockOnEdit = vi.fn();
  });

  describe('constructor', () => {
    it('should create editor with required parameters', () => {
      const editor = new InlineFieldEditor('testField', 'initial value', {
        onSave: mockOnSave
      });

      expect(editor.fieldName).toBe('testField');
      expect(editor.value).toBe('initial value');
      expect(editor.onSave).toBe(mockOnSave);
    });

    it('should throw TypeError if fieldName is missing', () => {
      expect(() => {
        new InlineFieldEditor('', 'value', { onSave: mockOnSave });
      }).toThrow(TypeError);
    });

    it('should throw TypeError if onSave is missing', () => {
      expect(() => {
        new InlineFieldEditor('field', 'value', {});
      }).toThrow(TypeError);
    });

    it('should accept optional onEdit callback', () => {
      const editor = new InlineFieldEditor('field', 'value', {
        onSave: mockOnSave,
        onEdit: mockOnEdit
      });

      expect(editor.onEdit).toBe(mockOnEdit);
    });

    it('should use default maxLength of 500', () => {
      const editor = new InlineFieldEditor('field', 'value', {
        onSave: mockOnSave
      });

      expect(editor.maxLength).toBe(500);
    });

    it('should accept custom maxLength', () => {
      const editor = new InlineFieldEditor('field', 'value', {
        onSave: mockOnSave,
        maxLength: 200
      });

      expect(editor.maxLength).toBe(200);
    });
  });

  describe('render', () => {
    it('should create contenteditable span element', () => {
      const editor = new InlineFieldEditor('field', 'test value', {
        onSave: mockOnSave
      });

      const element = editor.render();

      expect(element.tagName).toBe('SPAN');
      expect(element.contentEditable).toBe('true');
      expect(element.textContent).toBe('test value');
    });

    it('should create div element when multiline is true', () => {
      const editor = new InlineFieldEditor('field', 'test value', {
        onSave: mockOnSave,
        multiline: true
      });

      const element = editor.render();

      expect(element.tagName).toBe('DIV');
    });

    it('should set accessibility attributes', () => {
      const editor = new InlineFieldEditor('costEstimate', 'test value', {
        onSave: mockOnSave
      });

      const element = editor.render();

      expect(element.getAttribute('role')).toBe('textbox');
      expect(element.getAttribute('aria-label')).toBe('Editable costEstimate');
      expect(element.getAttribute('data-field-name')).toBe('costEstimate');
    });
  });

  describe('handleFocus', () => {
    it('should store original value on focus', () => {
      const editor = new InlineFieldEditor('field', 'original', {
        onSave: mockOnSave,
        onEdit: mockOnEdit
      });

      const element = editor.render();
      element.textContent = 'modified';

      element.dispatchEvent(new FocusEvent('focus'));

      expect(editor.originalValue).toBe('modified');
    });

    it('should call onEdit callback if provided', () => {
      const editor = new InlineFieldEditor('field', 'value', {
        onSave: mockOnSave,
        onEdit: mockOnEdit
      });

      const element = editor.render();
      element.dispatchEvent(new FocusEvent('focus'));

      expect(mockOnEdit).toHaveBeenCalledWith('field');
    });

    it('should add editing class', () => {
      const editor = new InlineFieldEditor('field', 'value', {
        onSave: mockOnSave
      });

      const element = editor.render();
      element.dispatchEvent(new FocusEvent('focus'));

      expect(element.classList.contains('editing')).toBe(true);
    });
  });

  describe('handleInput', () => {
    it('should enforce maxLength', () => {
      const editor = new InlineFieldEditor('field', '', {
        onSave: mockOnSave,
        maxLength: 10
      });

      const element = editor.render();
      element.textContent = '12345678901234567890'; // 20 characters

      element.dispatchEvent(new Event('input'));

      expect(element.textContent.length).toBeLessThanOrEqual(10);
    });
  });

  describe('handleBlur', () => {
    it('should call onSave with sanitized value', () => {
      const editor = new InlineFieldEditor('field', 'original', {
        onSave: mockOnSave
      });

      const element = editor.render();
      element.textContent = 'new value';

      element.dispatchEvent(new FocusEvent('blur'));

      expect(mockOnSave).toHaveBeenCalledWith('field', 'new value');
    });

    it('should sanitize HTML-unsafe characters', () => {
      const editor = new InlineFieldEditor('field', 'original', {
        onSave: mockOnSave
      });

      const element = editor.render();
      element.textContent = '<script>alert("xss")</script>';

      element.dispatchEvent(new FocusEvent('blur'));

      expect(mockOnSave).toHaveBeenCalled();
      const savedValue = mockOnSave.mock.calls[0][1];
      expect(savedValue).not.toContain('<');
      expect(savedValue).not.toContain('>');
    });

    it('should not call onSave if value unchanged', () => {
      const editor = new InlineFieldEditor('field', 'original', {
        onSave: mockOnSave
      });

      const element = editor.render();
      // Don't change textContent

      element.dispatchEvent(new FocusEvent('blur'));

      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('should remove editing class', () => {
      const editor = new InlineFieldEditor('field', 'value', {
        onSave: mockOnSave
      });

      const element = editor.render();
      element.classList.add('editing');

      element.dispatchEvent(new FocusEvent('blur'));

      expect(element.classList.contains('editing')).toBe(false);
    });
  });

  describe('handleKeydown', () => {
    it('should save and blur on Enter key (single-line mode)', () => {
      const editor = new InlineFieldEditor('field', 'value', {
        onSave: mockOnSave,
        multiline: false
      });

      const element = editor.render();
      const blurSpy = vi.spyOn(element, 'blur');
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      element.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(blurSpy).toHaveBeenCalled();
    });

    it('should allow Enter key in multiline mode', () => {
      const editor = new InlineFieldEditor('field', 'value', {
        onSave: mockOnSave,
        multiline: true
      });

      const element = editor.render();
      const blurSpy = vi.spyOn(element, 'blur');
      const event = new KeyboardEvent('keydown', { key: 'Enter' });

      element.dispatchEvent(event);

      expect(blurSpy).not.toHaveBeenCalled();
    });

    it('should revert and blur on Escape key', () => {
      const editor = new InlineFieldEditor('field', 'original', {
        onSave: mockOnSave
      });

      const element = editor.render();
      element.textContent = 'modified';

      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      element.dispatchEvent(event);

      expect(element.textContent).toBe('original');
    });
  });

  describe('setValue', () => {
    it('should update value programmatically', () => {
      const editor = new InlineFieldEditor('field', 'original', {
        onSave: mockOnSave
      });

      const element = editor.render();
      editor.setValue('new value');

      expect(editor.value).toBe('new value');
      expect(element.textContent).toBe('new value');
    });
  });

  describe('getValue', () => {
    it('should return current value', () => {
      const editor = new InlineFieldEditor('field', 'test value', {
        onSave: mockOnSave
      });

      expect(editor.getValue()).toBe('test value');
    });
  });

  describe('destroy', () => {
    it('should remove element from DOM', () => {
      const editor = new InlineFieldEditor('field', 'value', {
        onSave: mockOnSave
      });

      const element = editor.render();
      document.body.appendChild(element);

      editor.destroy();

      expect(document.body.contains(element)).toBe(false);
      expect(editor.element).toBeNull();
    });

    it('should remove event listeners', () => {
      const editor = new InlineFieldEditor('field', 'value', {
        onSave: mockOnSave
      });

      const element = editor.render();
      editor.destroy();

      // Verify no errors when dispatching events after destroy
      expect(() => {
        element.dispatchEvent(new FocusEvent('blur'));
      }).not.toThrow();

      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  // CodeRabbit: Add test for onSave failure path
  describe('error handling', () => {
    it('should revert value when onSave throws', () => {
      const throwingOnSave = vi.fn(() => {
        throw new Error('Save failed');
      });
      const editor = new InlineFieldEditor('field', 'original', {
        onSave: throwingOnSave
      });

      const element = editor.render();
      element.textContent = 'modified';

      element.dispatchEvent(new FocusEvent('blur'));

      // Both internal value and DOM should revert
      expect(editor.getValue()).toBe('original');
      expect(element.textContent).toBe('original');
    });
  });
});
