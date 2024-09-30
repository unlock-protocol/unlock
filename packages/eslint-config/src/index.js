const baseConfig = require('./base.js')
const prettierConfig = require('eslint-config-prettier')

/** @typedef {import('eslint').Linter.Config} ESLintConfig */

/**
 * @type {ESLintConfig}
 */
module.exports = [...baseConfig, prettierConfig]
