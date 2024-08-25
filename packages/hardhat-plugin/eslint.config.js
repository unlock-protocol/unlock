const rulesToIgnore = [
  'import/extensions',
  'no-param-reassign',
  'import/no-extraneous-dependencies',
  '@typescript-eslint/no-require-imports',
]

const unlockProtocolConfig = require('@unlock-protocol/eslint-config')

module.exports = [
  ...unlockProtocolConfig,
  {
    rules: {
      ...rulesToIgnore.reduce((obj, rule) => ({ ...obj, [rule]: 'off' }), {}),
    },
  },
]
