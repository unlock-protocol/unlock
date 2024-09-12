const unlockProtocolConfig = require('@unlock-protocol/eslint-config')

module.exports = [
  ...unlockProtocolConfig,
  {
    rules: {
      '@typescript-eslint/ban-types': 'warn',
    },
  },
]
