const unlockConfig = require('@unlock-protocol/eslint-config/next')
module.exports = [
  ...unlockConfig,
  {
    ignores: [
      'build',
      'coverage',
      'src/.next',
      'out',
      '.cache',
      'paywall.min.js',
    ],
  },
]
