const unlockConfig = require('@unlock-protocol/eslint-config/next')
module.exports = [
  ...unlockConfig,
  {
    ignores: ['public/*.min.js', 'tsconfig.json'],
  },
]
