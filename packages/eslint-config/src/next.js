/* eslint-disable @typescript-eslint/no-require-imports */
/** @typedef {import('eslint').Linter.Config} ESLintConfig */

/**
 * @type {ESLintConfig}
 */
module.exports = [
  require('./base.js'),
  require('prettier'),
  // require('next/core-web-vitals'),
  {
    rules: {
      '@next/next/no-img-element': 0,
      '@next/next/no-html-link-for-pages': 0,
      '@typescript-eslint/no-require-imports': 'warn',
    },
  },
]
