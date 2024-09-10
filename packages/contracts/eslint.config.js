/* eslint-disable @typescript-eslint/no-require-imports */
const unlockProtocolConfig = require('@unlock-protocol/eslint-config')

module.exports = [
  ...unlockProtocolConfig,
  {
    rules: {
      'import/extensions': 'off',
      'import/no-extraneous-dependencies': 'off',
    },
    languageOptions: {
      globals: {
        it: 'readonly',
        describe: 'readonly',
        before: 'readonly',
        beforeEach: 'readonly',
        after: 'readonly',
        afterEach: 'readonly',
      },
    },
  },
  {
    ignores: ['src/index.ts'],
  },
]
