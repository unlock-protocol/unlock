/* eslint-disable @typescript-eslint/no-require-imports */
const baseConfig = require('./base.js')
const prettierConfig = require('eslint-config-prettier')

/** @typedef {import('eslint').Linter.Config} ESLintConfig */

/**
 * @type {ESLintConfig}
 */
module.exports = [
  ...baseConfig,
  prettierConfig,
  {
    rules: {
      '@next/next/no-img-element': 'off',
      '@next/next/no-html-link-for-pages': 'off',
      '@typescript-eslint/no-require-imports': 'warn',
    },
  },
]
