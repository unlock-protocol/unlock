const unlockConfig = require('@unlock-protocol/eslint-config/next')
module.exports = [
  ...unlockConfig,
  {
    ignores: [
      'build',
      'dist',
      'coverage',
      '__tests__/utils/withConfig/__snapshots',
      'src/.next',
      'src/out',
      '.cache',
      'src/paywall-script/dist/',
      'src/paywall-script/module.d.ts',
      '*.min.js',
    ],
  },
]
