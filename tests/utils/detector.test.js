/**
 * Unit tests for scope creep detector
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  detectScopeCreep,
  detectScopeCreepBatch,
  isHighConfidence,
  filterHighConfidence,
  getDetectionStats,
  validateAccuracy,
  TEST_CORPUS
} from '../../src/utils/detector.js';

describe('detectScopeCreep', () => {
  describe('Basic detection', () => {
    it('should detect high-confidence scope creep patterns', () => {
      const tests = [
        { text: 'Also, can you add a login feature?', expectedWeight: 9 },
        { text: 'Additionally, please implement user profiles', expectedWeight: 9 },
        { text: 'I forgot to mention we need analytics', expectedWeight: 9 },
        { text: 'One more thing - add a dashboard', expectedWeight: 8 },
        { text: 'While you\'re at it, fix the navigation', expectedWeight: 7 }
      ];

      tests.forEach(({ text, expectedWeight }) => {
        const result = detectScopeCreep(text);
        expect(result.matched).toBe(true);
        expect(result.triggerWeight).toBeGreaterThanOrEqual(expectedWeight - 1);
        expect(result.triggerWord).toBeDefined();
        expect(result.context).toContain(text);
      });
    });

    it('should detect medium-confidence patterns', () => {
      const tests = [
        'By the way, can we change the color scheme?',
        'Oh and could you update the footer?'
      ];

      tests.forEach(text => {
        const result = detectScopeCreep(text);
        expect(result.matched).toBe(true);
        expect(result.triggerWeight).toBeGreaterThanOrEqual(5);
        expect(result.triggerWeight).toBeLessThanOrEqual(7);
      });
    });

    it('should detect low-confidence patterns', () => {
      const tests = [
        'Can you add social media links?',
        'Please add export functionality',
        'We need email notifications'
      ];

      tests.forEach(text => {
        const result = detectScopeCreep(text);
        expect(result.matched).toBe(true);
        expect(result.triggerWeight).toBeLessThan(5);
      });
    });

    it('should not detect false positives', () => {
      const tests = [
        'Also, thank you for your help',
        'Additionally, everything looks great',
        'By the way, when is the deadline?',
        'One more thing - great job!',
        'I appreciate your work on this'
      ];

      tests.forEach(text => {
        const result = detectScopeCreep(text);
        expect(result.matched).toBe(false);
      });
    });

    it('should handle empty or invalid input', () => {
      expect(detectScopeCreep('').matched).toBe(false);
      expect(detectScopeCreep('   ').matched).toBe(false);
      expect(detectScopeCreep(null).matched).toBe(false);
      expect(detectScopeCreep(undefined).matched).toBe(false);
    });

    it('should be case insensitive', () => {
      const result1 = detectScopeCreep('ALSO, CAN YOU ADD A FEATURE?');
      const result2 = detectScopeCreep('also, can you add a feature?');

      expect(result1.matched).toBe(true);
      expect(result2.matched).toBe(true);
      expect(result1.triggerWeight).toBe(result2.triggerWeight);
    });

    it('should extract correct context', () => {
      const text = 'This is some text before. Also, can you add authentication? This is text after.';
      const result = detectScopeCreep(text);

      expect(result.matched).toBe(true);
      expect(result.context).toContain('Also, can you add');
      expect(result.context.length).toBeLessThanOrEqual(100);
    });

    it('should provide match index', () => {
      const text = 'Some prefix text. Also, can you add a feature?';
      const result = detectScopeCreep(text);

      expect(result.matched).toBe(true);
      expect(result.matchIndex).toBeGreaterThan(0);
      expect(text.substring(result.matchIndex)).toContain('Also');
    });
  });

  describe('Batch detection', () => {
    it('should process multiple texts', () => {
      const texts = [
        'Also, add a feature',
        'Normal text here',
        'One more thing - fix this'
      ];

      const results = detectScopeCreepBatch(texts);

      expect(results).toHaveLength(3);
      expect(results[0].matched).toBe(true);
      expect(results[1].matched).toBe(false);
      expect(results[2].matched).toBe(true);
    });
  });

  describe('Confidence filtering', () => {
    it('should identify high confidence results', () => {
      const highConfidence = { matched: true, triggerWeight: 8 };
      const lowConfidence = { matched: true, triggerWeight: 3 };
      const noMatch = { matched: false };

      expect(isHighConfidence(highConfidence)).toBe(true);
      expect(isHighConfidence(lowConfidence)).toBe(false);
      expect(isHighConfidence(noMatch)).toBe(false);
    });

    it('should filter by confidence threshold', () => {
      const results = [
        { matched: true, triggerWeight: 9 },
        { matched: true, triggerWeight: 6 },
        { matched: true, triggerWeight: 3 },
        { matched: false }
      ];

      const filtered = filterHighConfidence(results, 6);
      expect(filtered).toHaveLength(2);
      expect(filtered[0].triggerWeight).toBe(9);
      expect(filtered[1].triggerWeight).toBe(6);
    });
  });

  describe('Statistics', () => {
    it('should calculate detection statistics', () => {
      const results = [
        { matched: true, triggerWeight: 9 },
        { matched: true, triggerWeight: 5 },
        { matched: true, triggerWeight: 3 },
        { matched: false },
        { matched: false }
      ];

      const stats = getDetectionStats(results);

      expect(stats.total).toBe(5);
      expect(stats.detected).toBe(3);
      expect(stats.detectionRate).toBe(60);
      expect(stats.averageWeight).toBeCloseTo(5.67, 1);
      expect(stats.highConfidence).toBe(1);
      expect(stats.mediumConfidence).toBe(1);
      expect(stats.lowConfidence).toBe(1);
    });
  });

  describe('Performance', () => {
    it('should detect within 10ms for typical text', () => {
      const text = 'Hey, also can you add user authentication to the app?';

      const start = performance.now();
      const result = detectScopeCreep(text);
      const elapsed = performance.now() - start;

      expect(result.matched).toBe(true);
      expect(elapsed).toBeLessThan(10);
    });

    it('should handle long texts efficiently', () => {
      const longText = 'Lorem ipsum '.repeat(100) + 'Also, can you add a feature?';

      const start = performance.now();
      const result = detectScopeCreep(longText);
      const elapsed = performance.now() - start;

      expect(result.matched).toBe(true);
      expect(elapsed).toBeLessThan(20);
    });
  });
});

describe('Test Corpus Validation', () => {
  it('should have valid test corpus', () => {
    expect(TEST_CORPUS.scopeCreep).toHaveLength(10);
    expect(TEST_CORPUS.normal).toHaveLength(10);
  });

  it('should detect all scope creep examples', () => {
    TEST_CORPUS.scopeCreep.forEach(text => {
      const result = detectScopeCreep(text);
      expect(result.matched).toBe(true);
    });
  });

  it('should not detect normal conversation', () => {
    let falsePositives = 0;
    TEST_CORPUS.normal.forEach(text => {
      const result = detectScopeCreep(text);
      if (result.matched) {
        falsePositives++;
      }
    });

    // False positive rate should be less than 30%
    const falsePositiveRate = (falsePositives / TEST_CORPUS.normal.length) * 100;
    expect(falsePositiveRate).toBeLessThanOrEqual(30);
  });

  it('should meet accuracy requirements', () => {
    const validation = validateAccuracy();

    // Should detect at least 70% of scope creep
    expect(validation.scopeCreepAccuracy).toBeGreaterThanOrEqual(70);

    // False positive rate should be less than 30%
    expect(validation.falsePositiveRate).toBeLessThanOrEqual(30);

    // Overall accuracy should be good
    expect(validation.overallAccuracy).toBeGreaterThanOrEqual(70);
  });
});

describe('Edge Cases', () => {
  it('should handle special characters', () => {
    const texts = [
      'Also, can you add @mentions?',
      'Additionally, implement #hashtags',
      'One more thing - add $pricing'
    ];

    texts.forEach(text => {
      const result = detectScopeCreep(text);
      expect(result.matched).toBe(true);
    });
  });

  it('should handle multiple triggers in one text', () => {
    const text = 'Also, add this. Additionally, add that. One more thing, add another.';
    const result = detectScopeCreep(text);

    expect(result.matched).toBe(true);
    // Should match the highest confidence trigger
    expect(result.triggerWeight).toBeGreaterThanOrEqual(8);
  });

  it('should handle triggers at different positions', () => {
    const tests = [
      'Also, add this feature', // Beginning
      'Can you also add this feature?', // Middle
      'Add this feature also' // End (might not match depending on pattern)
    ];

    // At least the first two should match
    const results = tests.map(text => detectScopeCreep(text));
    const matches = results.filter(r => r.matched).length;
    expect(matches).toBeGreaterThanOrEqual(2);
  });
});