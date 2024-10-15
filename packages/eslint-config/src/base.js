const eslint = require('@eslint/js')
const typescriptEslint = require('typescript-eslint')
const vitestPlugin = require('@vitest/eslint-plugin')
const prettierPlugin = require('eslint-plugin-prettier')
const mochaPlugin = require('eslint-plugin-mocha')
const evmAddressPlugin = require('eslint-plugin-evm-address-to-checksummed')
const jsonPlugin = require('eslint-plugin-json')
const globals = require('globals')

/** @typedef {import('eslint').Linter.Config} ESLintConfig */

/**
 * @type {ESLintConfig}
 */
module.exports = [
  eslint.configs.recommended,
  ...typescriptEslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      parser: typescriptEslint.parser,
      parserOptions: {
        // project: true,
      },
      globals: {
        ...globals.es2020,
        ...globals.node,
        ...globals.browser,
        ...globals.jest,
        ...globals.mocha,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    plugins: {
      '@typescript-eslint': typescriptEslint.plugin,
      vitest: vitestPlugin,
      prettier: prettierPlugin,
      mocha: mochaPlugin,
      'evm-address-to-checksummed': evmAddressPlugin,
      json: jsonPlugin,
    },
    rules: {
      'prettier/prettier': 'error',
      'linebreak-style': ['error', 'unix'],
      'mocha/no-exclusive-tests': 'error',
      quotes: [
        'error',
        'single',
        { avoidEscape: true, allowTemplateLiterals: false },
      ],
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0, maxBOF: 0 }],
      'brace-style': 'off',
      'no-constant-condition': 'off',
      'no-promise-executor-return': 'off',
      'vitest/no-disabled-tests': 'warn',
      'vitest/no-identical-title': 'error',
      'vitest/no-focused-tests': 'error',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-var-requires': 'warn',
      '@typescript-eslint/no-empty-function': 'warn',
      '@typescript-eslint/no-namespace': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      'evm-address-to-checksummed/evm-address-to-checksummed': 'error',
      '@typescript-eslint/no-require-imports': 'warn',
    },
    settings: {
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
      'import/resolver': {
        typescript: {},
      },
    },
  },
  {
    files: ['**/*.json'],
    ...jsonPlugin.configs.recommended,
  },
  {
    ignores: [
      'node_modules',
      'build',
      'coverage',
      'dist',
      'out',
      'src/@generated/',
    ],
  },
]
