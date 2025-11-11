import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

export default [
  // Base recommended config
  js.configs.recommended,

  // Global ignores
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**']
  },

  // Main source files
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.webextensions,
        chrome: 'readonly'
      }
    },
    rules: {
      // Code complexity rules
      'max-lines': [
        'warn',
        {
          max: 500,
          skipBlankLines: true,
          skipComments: true
        }
      ],
      'max-lines-per-function': [
        'warn',
        {
          max: 50,
          skipBlankLines: true,
          skipComments: true,
          IIFEs: true
        }
      ],
      complexity: ['warn', 15],
      'max-depth': ['error', 4],
      'max-params': ['warn', 4],
      'max-statements': ['warn', 20],
      'max-len': [
        'warn',
        {
          code: 100,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreRegExpLiterals: true,
          ignoreComments: true
        }
      ],

      // Async/await rules
      'no-await-in-loop': 'warn',
      'no-async-promise-executor': 'error',

      // Console and variables
      'no-console': 'off',
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_'
        }
      ],

      // Modern JavaScript
      'no-var': 'error',
      'prefer-const': 'warn',
      'prefer-arrow-callback': 'warn',
      'prefer-template': 'warn',

      // Restricted APIs (Privacy-First & Performance)
      'no-restricted-properties': [
        'error',
        {
          object: 'document',
          property: 'write',
          message: 'document.write() blocks page rendering and should not be used'
        }
      ],
      'no-restricted-globals': [
        'error',
        {
          name: 'XMLHttpRequest',
          message: 'Use fetch() instead of XMLHttpRequest for async operations'
        }
      ]
    }
  },

  // Test files
  {
    files: ['tests/**/*.js', '**/*.test.js', '**/*.spec.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        vi: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly'
      }
    },
    rules: {
      'max-lines-per-function': 'off',
      'max-lines': 'off',
      'no-unused-expressions': 'off'
    }
  },

  // Prettier config (must be last to override other configs)
  prettierConfig
];
