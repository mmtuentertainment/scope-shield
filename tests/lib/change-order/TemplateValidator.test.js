/**
 * TemplateValidator Tests
 * Comprehensive test coverage for template validation functionality
 */

import { describe, it, expect } from 'vitest';
import { TemplateValidator, MAX_NESTING_DEPTH } from '../../../src/lib/change-order/TemplateValidator.js';

describe('TemplateValidator', () => {
  describe('validate', () => {
    it('should return valid for empty template', () => {
      const result = TemplateValidator.validate('');

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return valid for simple text without tags', () => {
      const result = TemplateValidator.validate('Hello {{name}}, welcome!');

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return valid for properly matched tags', () => {
      const template = '{{@if condition}}true{{/@if}}';
      const result = TemplateValidator.validate(template);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect unclosed conditional blocks', () => {
      const template = '{{@if condition}}content';
      const result = TemplateValidator.validate(template);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Unclosed conditional block: 1 unclosed {{@if tag(s)');
    });

    it('should detect unclosed loop blocks', () => {
      const template = '{{@each items}}content';
      const result = TemplateValidator.validate(template);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Unclosed loop block: 1 unclosed {{@each tag(s)');
    });

    it('should detect mismatched delimiters', () => {
      const template = '{{variable} {{other';
      const result = TemplateValidator.validate(template);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Mismatched delimiters'))).toBe(true);
    });

    it('should warn about empty variable references', () => {
      const template = 'Hello {{}} world';
      const result = TemplateValidator.validate(template);

      expect(result.warnings.some(w => w.includes('empty variable reference'))).toBe(true);
    });

    it('should detect excessive nesting depth', () => {
      // Create template with 6 levels of nesting (exceeds MAX_NESTING_DEPTH of 5)
      const template = '{{@if a}}{{@if b}}{{@if c}}{{@if d}}{{@if e}}{{@if f}}deep{{/@if}}{{/@if}}{{/@if}}{{/@if}}{{/@if}}{{/@if}}';
      const result = TemplateValidator.validate(template);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Nesting depth exceeds limit'))).toBe(true);
    });

    it('should warn about potential circular references', () => {
      const template = '{{@each items}}{{items}}{{/@each}}';
      const result = TemplateValidator.validate(template);

      expect(result.warnings.some(w => w.includes('circular reference'))).toBe(true);
    });
  });

  describe('validateMatchingTags', () => {
    it('should validate properly matched tags', () => {
      const text = '{{@if condition}}content{{/@if}}';
      const result = TemplateValidator.validateMatchingTags(text, '{{@if', '{{/@if}}');

      expect(result.valid).toBe(true);
    });

    it('should detect unclosed opening tags', () => {
      const text = '{{@if condition}}content';
      const result = TemplateValidator.validateMatchingTags(text, '{{@if', '{{/@if}}');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('unclosed');
    });

    it('should detect unmatched closing tags', () => {
      const text = 'content{{/@if}}';
      const result = TemplateValidator.validateMatchingTags(text, '{{@if', '{{/@if}}');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('without matching opening tag');
    });

    it('should handle nested tags correctly', () => {
      const text = '{{@if a}}{{@if b}}nested{{/@if}}{{/@if}}';
      const result = TemplateValidator.validateMatchingTags(text, '{{@if', '{{/@if}}');

      expect(result.valid).toBe(true);
    });

    it('should detect multiple unclosed tags', () => {
      const text = '{{@if a}}{{@if b}}{{@if c}}content{{/@if}}';
      const result = TemplateValidator.validateMatchingTags(text, '{{@if', '{{/@if}}');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('2 unclosed');
    });
  });

  describe('validateDelimiters', () => {
    it('should validate balanced delimiters', () => {
      const text = '{{name}} and {{age}}';
      const result = TemplateValidator.validateDelimiters(text);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect unbalanced delimiters', () => {
      const text = '{{name} and {{age}}';
      const result = TemplateValidator.validateDelimiters(text);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Mismatched delimiters'))).toBe(true);
    });

    it('should warn about empty variable references', () => {
      const text = 'Hello {{  }} world';
      const result = TemplateValidator.validateDelimiters(text);

      expect(result.warnings.some(w => w.includes('empty variable reference'))).toBe(true);
    });

    it('should warn about invalid variable names', () => {
      const text = '{{name-with-dash}}';
      const result = TemplateValidator.validateDelimiters(text);

      expect(result.warnings.some(w => w.includes('invalid variable name'))).toBe(true);
    });

    it('should allow dots in variable names (nested properties)', () => {
      const text = '{{user.name}}';
      const result = TemplateValidator.validateDelimiters(text);

      expect(result.warnings).toHaveLength(0);
    });

    it('should not warn about directive tags', () => {
      const text = '{{@if condition}}{{/@if}}';
      const result = TemplateValidator.validateDelimiters(text);

      // Should not warn about @if being invalid variable name
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('validateNestingDepth', () => {
    it('should return depth 0 for template without nesting', () => {
      const text = 'Simple text with {{variable}}';
      const result = TemplateValidator.validateNestingDepth(text);

      expect(result.valid).toBe(true);
      expect(result.depth).toBe(0);
    });

    it('should calculate depth correctly for single level', () => {
      const text = '{{@if condition}}content{{/@if}}';
      const result = TemplateValidator.validateNestingDepth(text);

      expect(result.valid).toBe(true);
      expect(result.depth).toBe(1);
    });

    it('should calculate depth correctly for nested structures', () => {
      const text = '{{@if a}}{{@each items}}{{@if b}}deep{{/@if}}{{/@each}}{{/@if}}';
      const result = TemplateValidator.validateNestingDepth(text);

      expect(result.valid).toBe(true);
      expect(result.depth).toBe(3);
    });

    it('should allow maximum nesting depth', () => {
      // Create template with exactly MAX_NESTING_DEPTH levels
      const text = '{{@if a}}{{@if b}}{{@if c}}{{@if d}}{{@if e}}deep{{/@if}}{{/@if}}{{/@if}}{{/@if}}{{/@if}}';
      const result = TemplateValidator.validateNestingDepth(text);

      expect(result.valid).toBe(true);
      expect(result.depth).toBe(MAX_NESTING_DEPTH);
    });

    it('should reject excessive nesting depth', () => {
      // Create template with MAX_NESTING_DEPTH + 1 levels
      const text = '{{@if a}}{{@if b}}{{@if c}}{{@if d}}{{@if e}}{{@if f}}too deep{{/@if}}{{/@if}}{{/@if}}{{/@if}}{{/@if}}{{/@if}}';
      const result = TemplateValidator.validateNestingDepth(text);

      expect(result.valid).toBe(false);
      expect(result.depth).toBe(MAX_NESTING_DEPTH + 1);
    });
  });

  describe('checkCircularReferences', () => {
    it('should detect loop referencing itself', () => {
      const text = '{{@each items}}{{items}}{{/@each}}';
      const warnings = TemplateValidator.checkCircularReferences(text);

      expect(warnings).toHaveLength(1);
      expect(warnings[0]).toContain('circular reference');
    });

    it('should detect loop with nested reference', () => {
      const text = '{{@each items}}{{items.name}}{{/@each}}';
      const warnings = TemplateValidator.checkCircularReferences(text);

      expect(warnings).toHaveLength(1);
      expect(warnings[0]).toContain('items');
    });

    it('should not warn about different variables', () => {
      const text = '{{@each items}}{{item.name}}{{/@each}}';
      const warnings = TemplateValidator.checkCircularReferences(text);

      expect(warnings).toHaveLength(0);
    });

    it('should handle multiple loops independently', () => {
      const text = '{{@each items}}{{items}}{{/@each}} {{@each others}}{{item}}{{/@each}}';
      const warnings = TemplateValidator.checkCircularReferences(text);

      expect(warnings).toHaveLength(1);
      expect(warnings[0]).toContain('items');
    });
  });

  describe('suggestFixes', () => {
    it('should suggest fixes for unclosed conditional blocks', () => {
      const validationResult = {
        valid: false,
        errors: ['Unclosed conditional block: 1 unclosed {{@if tag(s)'],
        warnings: []
      };

      const fixes = TemplateValidator.suggestFixes(validationResult);

      expect(fixes).toContain('Add missing {{/@if}} closing tag');
    });

    it('should suggest fixes for unclosed loop blocks', () => {
      const validationResult = {
        valid: false,
        errors: ['Unclosed loop block: 1 unclosed {{@each tag(s)'],
        warnings: []
      };

      const fixes = TemplateValidator.suggestFixes(validationResult);

      expect(fixes).toContain('Add missing {{/@each}} closing tag');
    });

    it('should suggest fixes for mismatched delimiters', () => {
      const validationResult = {
        valid: false,
        errors: ['Mismatched delimiters: 3 opening {{ but 2 closing }}'],
        warnings: []
      };

      const fixes = TemplateValidator.suggestFixes(validationResult);

      expect(fixes).toContain('Check for missing {{ or }} in variable references');
    });

    it('should suggest fixes for excessive nesting', () => {
      const validationResult = {
        valid: false,
        errors: ['Nesting depth exceeds limit (max 5 levels): 6 levels found'],
        warnings: []
      };

      const fixes = TemplateValidator.suggestFixes(validationResult);

      expect(fixes).toContain('Simplify template by reducing nested conditionals and loops');
    });

    it('should return empty array for valid template', () => {
      const validationResult = {
        valid: true,
        errors: [],
        warnings: []
      };

      const fixes = TemplateValidator.suggestFixes(validationResult);

      expect(fixes).toHaveLength(0);
    });
  });
});
