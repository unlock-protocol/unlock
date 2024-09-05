const eslintConfig = require('@unlock-protocol/eslint-config')

module.exports = [
  ...eslintConfig,
  {
    files: ['*.js', '*.ts'],
  },
]
