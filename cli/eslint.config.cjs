const js = require('@eslint/js');
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const jestPlugin = require('eslint-plugin-jest');
const importPlugin = require('eslint-plugin-import');

module.exports = [
  // Global ignores
  {
    ignores: [
      'dist/',
      'lib/',
      'node_modules/',
      'jest.config.js'
    ]
  },

  // Base JavaScript recommended rules
  js.configs.recommended,

  // Base configuration for TypeScript and JavaScript files
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 9,
        sourceType: 'module',
        project: ['./tsconfig.json', './tsconfig.test.json']
      },
      globals: {
        ...require('globals').node,
        ...require('globals').es6
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      jest: jestPlugin,
      import: importPlugin
    },
    rules: {
      // Prettier and text rules
      'prettier/prettier': 'off',
      'i18n-text/no-en': 'off',

      // ESLint comment rules
      'eslint-comments/no-use': 'off',

      // Import rules
      'import/no-namespace': 'off',
      'import/newline-after-import': ['error', { count: 1 }],

      // General rules
      'no-unused-vars': 'off',
      'sort-imports': 'off',
      'filenames/match-regex': 'off',
      'camelcase': 'off',
      'semi': 'off',
      'no-shadow': 'off',
      'no-console': 'off',

      // TypeScript rules
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/explicit-member-accessibility': ['error', { accessibility: 'no-public' }],
      '@typescript-eslint/no-require-imports': 'error',
      '@typescript-eslint/array-type': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',
      '@typescript-eslint/consistent-type-assertions': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@/func-call-spacing': ['error', 'never'],
      '@typescript-eslint/no-array-constructor': 'error',
      '@typescript-eslint/no-empty-interface': 'error',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-extraneous-class': 'error',
      '@typescript-eslint/no-for-in-array': 'error',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-misused-new': 'error',
      '@typescript-eslint/no-namespace': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-unnecessary-qualifier': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/no-useless-constructor': 'error',
      '@typescript-eslint/no-var-requires': 'error',
      '@typescript-eslint/prefer-for-of': 'warn',
      '@typescript-eslint/prefer-function-type': 'warn',
      '@typescript-eslint/prefer-includes': 'error',
      '@typescript-eslint/prefer-string-starts-ends-with': 'error',
      '@typescript-eslint/promise-function-async': 'error',
      '@typescript-eslint/require-array-sort-compare': 'error',
      '@typescript-eslint/restrict-plus-operands': 'error',
      '@/semi': [2, 'always'],
      '@typescript-eslint/unbound-method': 'error',
      '@typescript-eslint/no-shadow': 'error'
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.ts', '.d.ts']
        }
      }
    }
  },

  // Jest globals for test files
  {
    files: ['**/*.test.ts', '**/*.test.js', '**/*.spec.ts', '**/*.spec.js'],
    languageOptions: {
      globals: {
        ...jestPlugin.environments.globals.globals
      }
    }
  }
];
