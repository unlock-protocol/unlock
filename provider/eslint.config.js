const unlockConfig = require('@unlock-protocol/eslint-config/next')
module.exports = [
  ...unlockConfig,
  {
    ignores: ['.wrangler', 'tsconfig.json'],
  },
  {
    rules: {
      'react/no-children-prop': 'off',
      'no-constant-binary-expression': 'warn',
    },
  },
]
