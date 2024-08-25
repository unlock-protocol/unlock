/* eslint-disable @typescript-eslint/no-require-imports */
const sortKeysFix = require('eslint-plugin-sort-keys-fix')

const unlockProtocolConfig = require('@unlock-protocol/eslint-config')

module.exports = [
  ...unlockProtocolConfig,
  {
    plugins: {
      'sort-keys-fix': sortKeysFix,
    },
    rules: {
      'sort-keys-fix/sort-keys-fix': 'error',
    },
  },
]
