const unlockConfig = require('@unlock-protocol/eslint-config')
module.exports = [
  ...unlockConfig,
  {
    rules: {
      // TODO: fix the functions this triggers
      'consistent-return': 'off',
      '@typescript-eslint/ban-types': 'off',
    },
  },
]
