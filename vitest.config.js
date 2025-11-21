// T008-T009: Vitest configuration with coverage
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Environment for DOM testing
    environment: 'jsdom',

    // Setup files run before each test file
    setupFiles: ['./tests/setup.js'],

    // Enable globals (describe, it, expect without imports)
    globals: true,

    // Test timeout (10s for async operations, 5s for hooks)
    testTimeout: 10000,
    hookTimeout: 5000,

    // Coverage configuration (T009)
    coverage: {
      provider: 'v8', // Fast, built-in coverage
      reporter: ['text', 'html', 'json'],
      include: ['src/lib/**/*.js'], // Only business logic
      exclude: [
        'src/lib/**/*.test.js',
        'src/lib/**/*.spec.js',
        '**/node_modules/**',
        '**/tests/**'
      ],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80
      }
    },

    // Parallel execution for faster tests
    threads: true,
    isolate: true // Each test file in isolated environment
  }
});
