const rulesToIgnore = [
  'import/extensions',
  'no-param-reassign',
  'import/no-extraneous-dependencies',
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
