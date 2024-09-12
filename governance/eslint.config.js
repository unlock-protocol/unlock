const unlockConfig = require('@unlock-protocol/eslint-config')
module.exports = [
  ...unlockConfig,
  {
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
]
