const unlockProtocolConfig = require('@unlock-protocol/eslint-config')

module.exports = [
  ...unlockProtocolConfig,
  {
    rules: {
      'import/extensions': 'off',
      'import/no-extraneous-dependencies': 'off',
    },
  },
]
