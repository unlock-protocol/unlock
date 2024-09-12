const unlockConfig = require('@unlock-protocol/eslint-config')
const rulesToIgnore = [
  'no-underscore-dangle',
  'no-param-reassign',
  'no-use-before-define',
  'no-plusplus',
  'no-await-in-loop',
  'radix',
  'prefer-destructuring',
  'no-shadow',
  'no-loop-func',
  'eqeqeq',
  'no-useless-concat',
  'prefer-const',
  'no-return-await',
  'prefer-object-spread',
  '@typescript-eslint/no-var-requires',
  'import/extensions',
]

module.exports = [
  ...unlockConfig,
  {
    rules: {
      ...rulesToIgnore.reduce((obj, rule) => {
        return { ...obj, [rule]: 'off' }
      }, {}),
    },
  },
  {
    ignores: ['coverage'],
  },
]
