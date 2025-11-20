import { describe, it, expect, beforeEach } from 'vitest';
import { TemplateEngine } from '../../../src/lib/change-order/TemplateEngine.js';

describe('TemplateEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new TemplateEngine();
  });

  describe('Variable Replacement', () => {
    it('should replace simple variables', () => {
      const template = 'Hello {{name}}, welcome to {{company}}!';
      const data = { name: 'John', company: 'Acme Corp' };
      const result = engine.render(template, data);
      expect(result).toBe('Hello John, welcome to Acme Corp!');
    });

    it('should handle missing variables by leaving them as-is', () => {
      const template = 'Hello {{name}}, your balance is {{balance}}';
      const data = { name: 'Jane' };
      const result = engine.render(template, data);
      expect(result).toBe('Hello Jane, your balance is {{balance}}');
    });

    it('should handle variables with special characters in values', () => {
      const template = 'Message: {{message}}';
      const data = { message: 'Test & "quoted" <script>alert("xss")</script>' };
      const result = engine.render(template, data);
      expect(result).toContain('Test & "quoted"');
    });

    it('should handle nested property access', () => {
      const template = 'Name: {{user.name}}, Email: {{user.email}}';
      const data = { user: { name: 'Alice', email: 'alice@example.com' } };
      const result = engine.render(template, data);
      expect(result).toBe('Name: Alice, Email: alice@example.com');
    });

    it('should handle undefined nested properties gracefully', () => {
      const template = 'Value: {{user.missing.prop}}';
      const data = { user: {} };
      const result = engine.render(template, data);
      expect(result).toBe('Value: {{user.missing.prop}}');
    });
  });

  describe('Array Iteration', () => {
    it('should iterate over arrays with @each syntax', () => {
      const template = '{{@each items}}Item: {{name}}\n{{/@each}}';
      const data = {
        items: [
          { name: 'Item 1' },
          { name: 'Item 2' },
          { name: 'Item 3' }
        ]
      };
      const result = engine.render(template, data);
      expect(result).toBe('Item: Item 1\nItem: Item 2\nItem: Item 3\n');
    });

    it('should handle empty arrays', () => {
      const template = '{{@each items}}Item: {{name}}{{/@each}}';
      const data = { items: [] };
      const result = engine.render(template, data);
      expect(result).toBe('');
    });

    it('should provide @index in loops', () => {
      const template = '{{@each items}}{{@index}}. {{name}}\n{{/@each}}';
      const data = {
        items: [
          { name: 'First' },
          { name: 'Second' }
        ]
      };
      const result = engine.render(template, data);
      expect(result).toBe('0. First\n1. Second\n');
    });

    it('should handle nested arrays', () => {
      const template = '{{@each orders}}Order {{@index}}:\n{{@each items}}  - {{name}}\n{{/@each}}{{/@each}}';
      const data = {
        orders: [
          { items: [{ name: 'A' }, { name: 'B' }] },
          { items: [{ name: 'C' }] }
        ]
      };
      const result = engine.render(template, data);
      expect(result).toContain('Order 0:');
      expect(result).toContain('- A');
      expect(result).toContain('- B');
      expect(result).toContain('Order 1:');
      expect(result).toContain('- C');
    });

    it('should handle missing array gracefully', () => {
      const template = '{{@each items}}Item: {{name}}{{/@each}}';
      const data = {};
      const result = engine.render(template, data);
      expect(result).toBe('');
    });
  });

  describe('Conditionals', () => {
    it('should render content when condition is truthy', () => {
      const template = '{{@if showMessage}}Hello!{{/@if}}';
      const data = { showMessage: true };
      const result = engine.render(template, data);
      expect(result).toBe('Hello!');
    });

    it('should not render content when condition is falsy', () => {
      const template = '{{@if showMessage}}Hello!{{/@if}}';
      const data = { showMessage: false };
      const result = engine.render(template, data);
      expect(result).toBe('');
    });

    it('should handle @else blocks', () => {
      const template = '{{@if isLoggedIn}}Welcome back!{{@else}}Please log in{{/@if}}';
      const data1 = { isLoggedIn: true };
      const data2 = { isLoggedIn: false };
      expect(engine.render(template, data1)).toBe('Welcome back!');
      expect(engine.render(template, data2)).toBe('Please log in');
    });

    it('should handle nested conditionals', () => {
      const template = '{{@if user}}{{@if user.isPremium}}Premium User{{@else}}Regular User{{/@if}}{{/@if}}';
      const data1 = { user: { isPremium: true } };
      const data2 = { user: { isPremium: false } };
      const data3 = {};
      expect(engine.render(template, data1)).toBe('Premium User');
      expect(engine.render(template, data2)).toBe('Regular User');
      expect(engine.render(template, data3)).toBe('');
    });

    it('should handle missing condition variables as falsy', () => {
      const template = '{{@if missingVar}}Yes{{@else}}No{{/@if}}';
      const data = {};
      const result = engine.render(template, data);
      expect(result).toBe('No');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null data', () => {
      const template = 'Hello {{name}}';
      const result = engine.render(template, null);
      expect(result).toBe('Hello {{name}}');
    });

    it('should handle undefined data', () => {
      const template = 'Hello {{name}}';
      const result = engine.render(template, undefined);
      expect(result).toBe('Hello {{name}}');
    });

    it('should handle empty template', () => {
      const result = engine.render('', { name: 'Test' });
      expect(result).toBe('');
    });

    it('should handle null template', () => {
      const result = engine.render(null, { name: 'Test' });
      expect(result).toBe('');
    });

    it('should handle undefined template', () => {
      const result = engine.render(undefined, { name: 'Test' });
      expect(result).toBe('');
    });

    it('should throw TypeError for non-string template', () => {
      expect(() => engine.render(123, { name: 'Test' })).toThrow(TypeError);
      expect(() => engine.render({}, { name: 'Test' })).toThrow(TypeError);
      expect(() => engine.render([], { name: 'Test' })).toThrow(TypeError);
    });

    it('should handle template with no variables', () => {
      const template = 'This is plain text';
      const result = engine.render(template, { name: 'Test' });
      expect(result).toBe('This is plain text');
    });

    it('should handle very large arrays', () => {
      const items = Array.from({ length: 100 }, (_, i) => ({ name: `Item ${i}` }));
      const template = '{{@each items}}{{name}}\n{{/@each}}';
      const data = { items };
      const result = engine.render(template, data);
      expect(result.split('\n').length).toBe(101); // 100 items + trailing newline
    });

    it('should handle circular references without infinite loops', () => {
      const data = { name: 'Test' };
      data.self = data; // Circular reference
      const template = 'Name: {{name}}';
      const result = engine.render(template, data);
      expect(result).toBe('Name: Test');
    });

    it('should handle special regex characters in variable values', () => {
      const template = 'Pattern: {{pattern}}';
      const data = { pattern: '$100 (.*?) [test]' };
      const result = engine.render(template, data);
      expect(result).toBe('Pattern: $100 (.*?) [test]');
    });

    it('should handle malformed template with unclosed conditional', () => {
      const template = '{{@if condition}}This is not closed';
      const data = { condition: true };
      const result = engine.render(template, data);
      // Phase 8 (T370-T374): Should use fallback template on validation error
      expect(result).toContain('CHANGE ORDER REQUEST');
      expect(result).toContain('Generated by ScopeShield');
    });

    it('should handle malformed template with unclosed loop', () => {
      const template = '{{@each items}}Item: {{name}}';
      const data = { items: [{ name: 'Test' }] };
      const result = engine.render(template, data);
      // Phase 8 (T370-T374): Should use fallback template on validation error
      expect(result).toContain('CHANGE ORDER REQUEST');
      expect(result).toContain('Generated by ScopeShield');
    });

    it('should handle template with mismatched tags', () => {
      const template = '{{@if condition}}Content{{/@each}}';
      const data = { condition: true };
      const result = engine.render(template, data);
      // Phase 8 (T370-T374): Should use fallback template on validation error
      expect(result).toContain('CHANGE ORDER REQUEST');
      expect(result).toContain('Generated by ScopeShield');
    });

    it('should handle deeply nested structures without infinite loops', () => {
      // Test MAX_ITERATIONS limit
      const template = '{{@if a}}{{@if b}}{{@if c}}{{@if d}}Content{{/@if}}{{/@if}}{{/@if}}{{/@if}}';
      const data = { a: true, b: true, c: true, d: true };
      const result = engine.render(template, data);
      expect(result).toBe('Content');
    });
  });

  describe('Performance', () => {
    it('should render 50-item template in less than 500ms', () => {
      const items = Array.from({ length: 50 }, (_, i) => ({
        sender: `Client ${i}`,
        text: `Request ${i}: Can you also add this feature?`,
        trigger: 'also',
        date: `2025-01-${String(i + 1).padStart(2, '0')}`
      }));

      const template = `Change Order Request
Generated: {{date}}

{{@each items}}
{{@index}}. From: {{sender}}
   Message: {{text}}
   Trigger: {{trigger}}
   Date: {{date}}

{{/@each}}

Total Items: {{totalItems}}`;

      const data = {
        date: '2025-01-15',
        items,
        totalItems: items.length
      };

      const start = performance.now();
      const result = engine.render(template, data);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(500);
      expect(result).toContain('Total Items: 50');
      expect(result).toContain('Client 0');
      expect(result).toContain('Client 49');
    });

    it('should handle complex nested template efficiently', () => {
      const template = `
{{@if hasData}}
  {{@each sections}}
    Section: {{title}}
    {{@each items}}
      - {{name}}: {{value}}
    {{/@each}}
  {{/@each}}
{{@else}}
  No data available
{{/@if}}`;

      const data = {
        hasData: true,
        sections: Array.from({ length: 10 }, (_, i) => ({
          title: `Section ${i}`,
          items: Array.from({ length: 5 }, (_, j) => ({
            name: `Item ${j}`,
            value: `Value ${i}-${j}`
          }))
        }))
      };

      const start = performance.now();
      const result = engine.render(template, data);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(500);
      expect(result).toContain('Section 0');
      expect(result).toContain('Section 9');
      expect(result).toContain('Value 0-0');
      expect(result).toContain('Value 9-4');
    });
  });

  describe('Integration', () => {
    it('should handle realistic change order template', () => {
      const template = `CHANGE ORDER REQUEST

Date: {{generatedDate}}
Freelancer: {{freelancerName}}
Client: {{clientName}}

Scope Creep Detections:
{{@each detections}}
{{@index}}. {{sender}} ({{date}})
   Message: "{{text}}"
   Trigger: {{trigger}}
   {{@if estimatedHours}}Estimated Hours: {{estimatedHours}}{{/@if}}

{{/@each}}

{{@if totalHours}}
Summary:
- Total Additional Hours: {{totalHours}}
{{@if hourlyRate}}- Your Rate: \${{hourlyRate}}/hr
- Total Cost: \${{totalCost}}{{/@if}}
{{/@if}}

Please review and approve this change order for the additional work requested.`;

      const data = {
        generatedDate: '2025-01-15',
        freelancerName: 'John Developer',
        clientName: 'Acme Corp',
        detections: [
          {
            sender: 'client@example.com',
            date: '2025-01-10',
            text: 'Can you also add a login page?',
            trigger: 'also',
            estimatedHours: 8
          },
          {
            sender: 'client@example.com',
            date: '2025-01-12',
            text: 'One more thing - add export to PDF',
            trigger: 'one more thing',
            estimatedHours: 4
          }
        ],
        totalHours: 12,
        hourlyRate: 100,
        totalCost: 1200
      };

      const result = engine.render(template, data);

      expect(result).toContain('CHANGE ORDER REQUEST');
      expect(result).toContain('Freelancer: John Developer');
      expect(result).toContain('Client: Acme Corp');
      expect(result).toContain('Can you also add a login page?');
      expect(result).toContain('One more thing - add export to PDF');
      expect(result).toContain('Total Additional Hours: 12');
      expect(result).toContain('Your Rate: $100/hr');
      expect(result).toContain('Total Cost: $1200');
    });
  });
});
