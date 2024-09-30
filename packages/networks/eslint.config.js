const unlockProtocolConfig = require('@unlock-protocol/eslint-config')
const sortKeysFix = require('eslint-plugin-sort-keys-fix')
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
