/**
 * Accuracy validation tests (T031)
 * Tests detection accuracy against extended corpus
 */

import { describe, it, expect } from 'vitest';
import { detectScopeCreep, validateAccuracy } from '../../src/utils/detector.js';
import {
  EXTENDED_SCOPE_CREEP,
  EXTENDED_NORMAL,
  EDGE_CASE_CORPUS,
  DOMAIN_SPECIFIC_CORPUS,
  getCorpusStats
} from '../fixtures/extended-corpus.js';

describe('Extended Accuracy Validation', () => {
  describe('Detection Accuracy Metrics', () => {
    it('should achieve ≥75% detection rate on scope creep corpus', () => {
      const results = EXTENDED_SCOPE_CREEP.map(text => detectScopeCreep(text));
      const detected = results.filter(r => r.matched).length;
      const detectionRate = (detected / EXTENDED_SCOPE_CREEP.length) * 100;

      console.log(`Detection rate: ${detectionRate.toFixed(1)}% (${detected}/${EXTENDED_SCOPE_CREEP.length})`);
      expect(detectionRate).toBeGreaterThanOrEqual(75);
    });

    it('should achieve <25% false positive rate on normal corpus', () => {
      const results = EXTENDED_NORMAL.map(text => detectScopeCreep(text));
      const falsePositives = results.filter(r => r.matched).length;
      const falsePositiveRate = (falsePositives / EXTENDED_NORMAL.length) * 100;

      console.log(`False positive rate: ${falsePositiveRate.toFixed(1)}% (${falsePositives}/${EXTENDED_NORMAL.length})`);
      expect(falsePositiveRate).toBeLessThanOrEqual(25);
    });

    it('should achieve ≥80% overall accuracy', () => {
      const scopeCreepResults = EXTENDED_SCOPE_CREEP.map(text => detectScopeCreep(text));
      const normalResults = EXTENDED_NORMAL.map(text => detectScopeCreep(text));

      const truePositives = scopeCreepResults.filter(r => r.matched).length;
      const trueNegatives = normalResults.filter(r => !r.matched).length;
      const total = EXTENDED_SCOPE_CREEP.length + EXTENDED_NORMAL.length;

      const accuracy = ((truePositives + trueNegatives) / total) * 100;

      console.log(`Overall accuracy: ${accuracy.toFixed(1)}%`);
      expect(accuracy).toBeGreaterThanOrEqual(80);
    });
  });

  describe('Confidence Weight Distribution', () => {
    it('should assign appropriate weights to different patterns', () => {
      const testCases = [
        { text: 'Also, can you add this feature?', minWeight: 8 },
        { text: 'While you\'re at it, fix this', minWeight: 6 },
        { text: 'Can you add something?', maxWeight: 4 },
        { text: 'Also, thank you', shouldNotMatch: true }
      ];

      testCases.forEach(({ text, minWeight, maxWeight, shouldNotMatch }) => {
        const result = detectScopeCreep(text);

        if (shouldNotMatch) {
          expect(result.matched).toBe(false);
        } else {
          expect(result.matched).toBe(true);
          if (minWeight) {
            expect(result.triggerWeight).toBeGreaterThanOrEqual(minWeight);
          }
          if (maxWeight) {
            expect(result.triggerWeight).toBeLessThanOrEqual(maxWeight);
          }
        }
      });
    });

    it('should boost weight for urgent requests', () => {
      const normal = detectScopeCreep('Also, can you add reports?');
      const urgent = detectScopeCreep('Also, urgently add reports ASAP?');

      expect(urgent.matched).toBe(true);
      expect(normal.matched).toBe(true);
      expect(urgent.triggerWeight).toBeGreaterThan(normal.triggerWeight);
    });

    it('should boost weight for multiple triggers', () => {
      const single = detectScopeCreep('Also, add feature X');
      const multiple = detectScopeCreep('Also, add feature X. Additionally, add feature Y');

      expect(multiple.triggerWeight).toBeGreaterThanOrEqual(single.triggerWeight);
    });
  });

  describe('Edge Cases', () => {
    it('should handle mixed signal emails correctly', () => {
      EDGE_CASE_CORPUS.forEach(({ text, shouldMatch, _reason }) => {
        const result = detectScopeCreep(text);
        expect(result.matched).toBe(shouldMatch);
      });
    });

    it('should handle quoted requests appropriately', () => {
      const quoted = '> Also, can you add this feature?\nNo, we discussed this already.';
      const result = detectScopeCreep(quoted);

      // Should not match quoted text
      expect(result.matched).toBe(false);
    });

    it('should handle email threads correctly', () => {
      const thread = `
        Thanks for the update.

        Also, can you add user profiles?

        On Monday, John wrote:
        > We need to focus on the core features
      `;

      const result = detectScopeCreep(thread);
      expect(result.matched).toBe(true);
      expect(result.matchedText).toContain('also');
    });
  });

  describe('Domain-Specific Detection', () => {
    it('should detect ecommerce-specific scope creep', () => {
      const results = DOMAIN_SPECIFIC_CORPUS.ecommerce.map(text =>
        detectScopeCreep(text)
      );
      const detected = results.filter(r => r.matched).length;

      expect(detected).toBeGreaterThanOrEqual(2); // At least 2 out of 3
    });

    it('should detect SaaS-specific scope creep', () => {
      const results = DOMAIN_SPECIFIC_CORPUS.saas.map(text =>
        detectScopeCreep(text)
      );
      const detected = results.filter(r => r.matched).length;

      expect(detected).toBeGreaterThanOrEqual(2);
    });

    it('should detect mobile-specific scope creep', () => {
      const results = DOMAIN_SPECIFIC_CORPUS.mobile.map(text =>
        detectScopeCreep(text)
      );
      const detected = results.filter(r => r.matched).length;

      expect(detected).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Performance Benchmarks', () => {
    it('should process emails within performance budget', () => {
      const times = [];

      EXTENDED_SCOPE_CREEP.forEach(text => {
        const start = performance.now();
        detectScopeCreep(text);
        const elapsed = performance.now() - start;
        times.push(elapsed);
      });

      const average = times.reduce((a, b) => a + b, 0) / times.length;
      const p95 = times.sort((a, b) => a - b)[Math.floor(times.length * 0.95)];

      console.log(`Average: ${average.toFixed(2)}ms, P95: ${p95.toFixed(2)}ms`);

      expect(average).toBeLessThan(5);
      expect(p95).toBeLessThan(10);
    });
  });

  describe('Corpus Statistics', () => {
    it('should report corpus composition', () => {
      const stats = getCorpusStats();

      console.log('Corpus Statistics:');
      console.log('Scope Creep:');
      console.log(`  - Total: ${stats.scopeCreep.total}`);
      console.log(`  - High confidence: ${stats.scopeCreep.highConfidence}`);
      console.log(`  - Medium confidence: ${stats.scopeCreep.mediumConfidence}`);
      console.log(`  - Urgent: ${stats.scopeCreep.urgent}`);
      console.log('Normal:');
      console.log(`  - Total: ${stats.normal.total}`);
      console.log(`  - Gratitude: ${stats.normal.gratitude}`);
      console.log(`  - Questions: ${stats.normal.questions}`);
      console.log(`  - Status: ${stats.normal.status}`);

      expect(stats.scopeCreep.total).toBe(25);
      expect(stats.normal.total).toBe(25);
    });
  });

  describe('Built-in Validation', () => {
    it('should pass built-in validateAccuracy function', () => {
      const validation = validateAccuracy();

      console.log('Built-in Validation Results:');
      console.log(`  - Scope creep accuracy: ${validation.scopeCreepAccuracy.toFixed(1)}%`);
      console.log(`  - False positive rate: ${validation.falsePositiveRate.toFixed(1)}%`);
      console.log(`  - Overall accuracy: ${validation.overallAccuracy.toFixed(1)}%`);

      expect(validation.scopeCreepAccuracy).toBeGreaterThanOrEqual(70);
      expect(validation.falsePositiveRate).toBeLessThanOrEqual(30);
      expect(validation.overallAccuracy).toBeGreaterThanOrEqual(70);
    });
  });
});