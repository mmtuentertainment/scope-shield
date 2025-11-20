/**
 * Performance Benchmarking Script (Phase 9: T314-T320)
 *
 * Measures:
 * - Change order generation time (target: <5s p95)
 * - Export times (PDF <3s, Clipboard <500ms)
 * - Bundle size analysis
 *
 * Usage: node scripts/benchmark.js
 */

import { ChangeOrderBuilder } from '../src/lib/change-order/ChangeOrderBuilder.js';
import { FreelancerSettings } from '../src/lib/storage/FreelancerSettings.js';

// Mock chrome.storage for Node.js environment
global.chrome = {
  storage: {
    local: {
      get: async () => ({
        scopeshield_settings_v1: {
          freelancerName: 'Test Freelancer',
          hourlyRate: 150
        }
      }),
      set: async () => {}
    }
  }
};

/**
 * Generate an array of synthetic detection objects for benchmarking.
 * @param {number} count - Number of detection objects to generate.
 * @returns {Array<Object>} An array of detection objects each with properties:
 *  - `sender` (string): email address mock,
 *  - `text` (string): sample detection text,
 *  - `trigger` (string): trigger label,
 *  - `date` (string): ISO timestamp.
 */
function createSampleDetections(count) {
  const detections = [];
  for (let i = 0; i < count; i++) {
    detections.push({
      sender: `client${i}@example.com`,
      text: `Also, can you add feature ${i}? This is a test detection for benchmarking.`,
      trigger: 'also',
      date: new Date().toISOString()
    });
  }
  return detections;
}

/**
 * Run timed benchmarks for change order generation across multiple detection counts and log average and 95th-percentile durations.
 *
 * Performs several iterations per test case, measures each build invocation's duration, computes the average and p95 (95th percentile)
 * for each detection count, and prints the metrics and a pass/fail indicator against a 5000 ms p95 target to the console.
 * Loads persisted freelancer settings before running benchmarks.
 */
async function benchmarkGeneration() {
  console.log('\n=== CHANGE ORDER GENERATION BENCHMARK ===\n');

  const builder = new ChangeOrderBuilder();
  const settings = await FreelancerSettings.load();

  const testCases = [1, 5, 10, 25, 50];
  const iterations = 10; // Run each test 10 times for p95

  for (const detectionCount of testCases) {
    const times = [];

    for (let i = 0; i < iterations; i++) {
      const detections = createSampleDetections(detectionCount);
      const start = Date.now();
      await builder.build(detections, settings);
      const duration = Date.now() - start;
      times.push(duration);
    }

    // Calculate p95
    times.sort((a, b) => a - b);
    const p95 = times[Math.floor(times.length * 0.95)];
    const avg = times.reduce((a, b) => a + b, 0) / times.length;

    console.log(`${detectionCount} detections:`);
    console.log(`  Average: ${avg.toFixed(2)}ms`);
    console.log(`  P95: ${p95}ms`);
    console.log(`  Target: <5000ms ${p95 < 5000 ? '✅ PASS' : '❌ FAIL'}`);
    console.log('');
  }
}

/**
 * Prints human-readable instructions and target thresholds for bundle size analysis.
 *
 * Logs the shell command to build and inspect the distribution directory and the
 * expected size targets: total < 600 KB, feature 001 baseline ~500 KB, and feature 002
 * budget of < 100 KB increase.
 */
function benchmarkBundleSize() {
  console.log('\n=== BUNDLE SIZE ANALYSIS ===\n');
  console.log('Run: npm run build && du -sh dist/');
  console.log('Target: <600KB total');
  console.log('Feature 001 baseline: ~500KB');
  console.log('Feature 002 budget: <100KB increase\n');
}

/**
 * Print benchmark performance targets and related notes to the console.
 *
 * Logs target thresholds for generation, PDF export, clipboard operations, and
 * bundle size, and indicates that PDF and clipboard measurements require a
 * browser environment (suggesting manual testing in Chrome DevTools Performance).
 */
function printSummary() {
  console.log('\n=== PERFORMANCE TARGETS ===\n');
  console.log('Generation (SC-001): <5s p95');
  console.log('PDF Export (SC-003): <3s p95');
  console.log('Clipboard (SC-002): <500ms p95');
  console.log('Bundle Size (SC-006): <600KB total\n');
  console.log('Note: PDF and Clipboard benchmarks require browser environment');
  console.log('Run manual tests in Chrome DevTools Performance tab\n');
}

// Run all benchmarks
(async () => {
  try {
    await benchmarkGeneration();
    benchmarkBundleSize();
    printSummary();
  } catch (error) {
    console.error('Benchmark failed:', error);
    process.exit(1);
  }
})();