const unlockConfig = require('@unlock-protocol/eslint-config/next')
module.exports = [
  ...unlockConfig,
  {
    ignores: [
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
  {
    rules: {
      'react/no-children-prop': 'off',
      'no-constant-binary-expression': 'warn',
    },
  },
]
