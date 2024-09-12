/* eslint-disable @typescript-eslint/no-require-imports */
/** @typedef {import('eslint').Linter.Config} ESLintConfig */
const baseConfig = require('./base.js')
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended')
const { FlatCompat } = require('@eslint/eslintrc')
const { fixupConfigRules } = require('@eslint/compat')
const path = require('node:path')
const js = require('@eslint/js')
const { fileURLToPath } = require('node:url')

// https://blog.linotte.dev/eslint-9-next-js-935c2b6d0371 describes how the nextjs core vitals rule was added
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})
const patchedConfig = fixupConfigRules([
  ...compat.extends('next/core-web-vitals'),
])
/**
 * @type {ESLintConfig}
 */
module.exports = [
  ...patchedConfig,
  ...baseConfig,
  eslintPluginPrettierRecommended,
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
