const rulesToIgnore = [
  'import/no-extraneous-dependencies',
  'no-underscore-dangle',
  'no-param-reassign',
  'class-methods-use-this',
  'no-shadow',
  'eqeqeq',
  'consistent-return',
  'no-use-before-define',
  'no-return-assign',
  'no-return-await',
  'no-plusplus',
  'prefer-destructuring',
  'radix',
  'no-async-promise-executor',
  'no-promise-executor-return',
  'default-param-last',
  'prefer-promise-reject-errors',
  'prefer-const',
  '@typescript-eslint/no-require-imports',
]

const unlockProtocolConfig = require('@unlock-protocol/eslint-config')
/** @typedef {import('eslint').Linter.Config} ESLintConfig */

/**
 * @type {ESLintConfig}
 */
module.exports = [
  ...unlockProtocolConfig,
  {
    rules: {
      ...rulesToIgnore.reduce((obj, rule) => {
        return { ...obj, [rule]: 'off' }
      }, {}),
    },
  },
  {
    ignores: ['src/@generated/'],
  },
]
