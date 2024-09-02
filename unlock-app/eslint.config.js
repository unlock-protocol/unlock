const unlockConfig = require('@unlock-protocol/eslint-config/next')
module.exports = [
  ...unlockConfig,
  {
    ignore: [
      'build',
      'coverage',
      '__tests__/utils/withConfig/__snapshots',
      'src/.next',
      'out',
      '.cache',
      '.babelrc',
      'src/**/*.typegen.ts',
    ],
  },
]
