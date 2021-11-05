require('./src/utils/envLoader')
const base = require('@unlock-protocol/jest-config')

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
