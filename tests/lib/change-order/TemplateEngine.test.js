/**
 * TemplateEngine Tests
 *
 * Tests for template interpolation, placeholder handling, and array conversion.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TemplateEngine } from '../../../src/lib/change-order/TemplateEngine.js';

describe('TemplateEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new TemplateEngine();
    engine.clearCache(); // Clear cache before each test

    // Mock chrome.runtime.getURL
    global.chrome = {
      runtime: {
        getURL: vi.fn((path) => `chrome-extension://test/${path}`)
      }
    };

    // Mock fetch to return a simple template
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        text: () => Promise.resolve(`
<!DOCTYPE html>
<html>
<head><title>Test Template</title></head>
<body>
  <h1>{{title}}</h1>
  <p>{{clientName}}</p>
  <p>{{freelancerName}}</p>
  <div>{{requestedChanges}}</div>
  <p>{{missingField}}</p>
  <p>{{costEstimate}}</p>
</body>
</html>
        `)
      })
    );
  });

  describe('interpolate() - Simple Placeholder Replacement', () => {
    it('should replace simple string placeholders', async () => {
      const result = await engine.interpolate({
        title: 'Change Order #001',
        clientName: 'Acme Corp',
        freelancerName: 'John Doe',
        costEstimate: '$1,200'
      });

      expect(result).toContain('Change Order #001');
      expect(result).toContain('Acme Corp');
      expect(result).toContain('John Doe');
      expect(result).toContain('$1,200');
    });

    it('should handle HTML special characters (XSS protection)', async () => {
      const result = await engine.interpolate({
        clientName: '<script>alert("xss")</script>',
        title: 'Test & Verify'
      });

      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;script&gt;');
      expect(result).toContain('Test &amp; Verify');
    });

    it('should handle numeric values', async () => {
      const result = await engine.interpolate({
        title: 123,
        costEstimate: 1200
      });

      expect(result).toContain('123');
      expect(result).toContain('1200');
    });
  });

  describe('interpolate() - Missing Placeholder Handling', () => {
    it('should replace missing placeholders with empty string', async () => {
      const result = await engine.interpolate({
        title: 'Change Order',
        clientName: 'Acme Corp'
        // missing: freelancerName, requestedChanges, costEstimate, missingField
      });

      expect(result).toContain('Change Order');
      expect(result).toContain('Acme Corp');

      // Missing placeholders should be empty (not show {{placeholder}})
      expect(result).not.toContain('{{freelancerName}}');
      expect(result).not.toContain('{{requestedChanges}}');
      expect(result).not.toContain('{{missingField}}');
    });

    it('should handle null values as empty string', async () => {
      const result = await engine.interpolate({
        title: 'Test',
        clientName: null,
        freelancerName: null
      });

      expect(result).toContain('Test');
      expect(result).not.toContain('null');
    });

    it('should handle undefined values as empty string', async () => {
      const result = await engine.interpolate({
        title: 'Test',
        clientName: undefined,
        freelancerName: undefined
      });

      expect(result).toContain('Test');
      expect(result).not.toContain('undefined');
    });
  });

  describe('interpolate() - Array to Bulleted List Conversion', () => {
    it('should convert array to HTML bulleted list', async () => {
      const result = await engine.interpolate({
        requestedChanges: [
          'Add user authentication',
          'Implement dark mode',
          'Create admin dashboard'
        ]
      });

      expect(result).toContain('<ul>');
      expect(result).toContain('<li>Add user authentication</li>');
      expect(result).toContain('<li>Implement dark mode</li>');
      expect(result).toContain('<li>Create admin dashboard</li>');
      expect(result).toContain('</ul>');
    });

    it('should handle empty array with placeholder message', async () => {
      const result = await engine.interpolate({
        requestedChanges: []
      });

      expect(result).toContain('No changes specified');
      expect(result).toContain('empty-placeholder');
    });

    it('should escape HTML in array items', async () => {
      const result = await engine.interpolate({
        requestedChanges: [
          'Fix <script>alert("xss")</script> vulnerability',
          'Add "quotes" & special chars'
        ]
      });

      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;script&gt;');
      expect(result).toContain('&amp;');
      // Note: textContent doesn't encode double quotes, but they're safe in HTML content
      expect(result).toContain('"quotes"');
    });

    it('should handle single-item array', async () => {
      const result = await engine.interpolate({
        requestedChanges: ['Single change request']
      });

      expect(result).toContain('<ul>');
      expect(result).toContain('<li>Single change request</li>');
      expect(result).toContain('</ul>');
    });
  });

  describe('Template Caching', () => {
    it('should cache loaded template on first call', async () => {
      await engine.interpolate({ title: 'Test 1' });
      await engine.interpolate({ title: 'Test 2' });

      // fetch should only be called once (template cached)
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should reload template after clearCache()', async () => {
      await engine.interpolate({ title: 'Test 1' });
      engine.clearCache();
      await engine.interpolate({ title: 'Test 2' });

      // fetch should be called twice (cache cleared)
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should use chrome.runtime.getURL for template path', async () => {
      await engine.interpolate({ title: 'Test' });

      expect(global.chrome.runtime.getURL).toHaveBeenCalledWith(
        'assets/templates/professional-v1.html'
      );
    });
  });

  describe('Error Handling', () => {
    it('should throw error if template fetch fails', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 404,
          statusText: 'Not Found'
        })
      );

      engine.clearCache();

      await expect(engine.interpolate({ title: 'Test' })).rejects.toThrow(
        'Template loading failed'
      );
    });

    it('should throw error if fetch rejects', async () => {
      global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

      engine.clearCache();

      await expect(engine.interpolate({ title: 'Test' })).rejects.toThrow(
        'Template loading failed'
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty values object', async () => {
      const result = await engine.interpolate({});

      // Should return template with all placeholders empty
      expect(result).not.toContain('{{');
      expect(result).toContain('<html>');
    });

    it('should handle very long string values', async () => {
      const longString = 'A'.repeat(1000);
      const result = await engine.interpolate({
        title: longString
      });

      expect(result).toContain(longString);
    });

    it('should handle special characters in keys', async () => {
      const result = await engine.interpolate({
        title: 'Normal key',
        'invalid-key': 'Should be ignored' // Invalid key with hyphen
      });

      expect(result).toContain('Normal key');
      // Invalid key should be ignored (not match {{placeholder}} pattern)
    });

    it('should handle boolean values', async () => {
      const result = await engine.interpolate({
        title: true,
        clientName: false
      });

      expect(result).toContain('true');
      expect(result).toContain('false');
    });
  });
});
