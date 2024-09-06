const unlockProtocolConfig = require('@unlock-protocol/eslint-config')
const rulesToIgnore = [
  'import/extensions',
  'no-param-reassign',
  'import/no-extraneous-dependencies',
]
module.exports = [
  ...unlockProtocolConfig,
  {
    rules: {
      ...rulesToIgnore.reduce((obj, rule) => ({ ...obj, [rule]: 'off' }), {}),
    },
  },
]
