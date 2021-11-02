const base = require('@unlock-protocol/eslint-config')
require('./src/utils/envLoader')

module.exports = {
  ...base,
  testPathIgnorePatterns: ['<rootDir>/__tests__/test-helpers/'],
  coverageThreshold: {
    global: {
      branches: 63,
      functions: 73,
      lines: 75,
    },
  },
}
