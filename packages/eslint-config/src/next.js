/* eslint-disable @typescript-eslint/no-require-imports */
/** @typedef {import('eslint').Linter.Config} ESLintConfig */
const baseConfig = require('./base.js')
const prettierConfig = require('prettier-linter-helpers')
const nextConfig = require('@next/eslint-plugin-next')

/**
 * @type {ESLintConfig}
 */
module.exports = [
  ...baseConfig,
  // ...prettierConfig.,
  // nextConfig.configs.recommended,
  {
    rules: {
      '@next/next/no-img-element': 0,
      '@next/next/no-html-link-for-pages': 0,
      '@typescript-eslint/no-explicit-any': 1,
      quotes: 'warn',
      '@typescript-eslint/no-unused-expressions': 'warn',
    },
  },
]
