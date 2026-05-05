/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires */
const unlockConfig = require('@unlock-protocol/eslint-config/next')

module.exports = [
  ...unlockConfig,
  {
    ignores: ['next-env.d.ts', 'tsconfig.json'],
  },
]
