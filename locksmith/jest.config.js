require('./src/utils/envLoader')
const base = require('@unlock-protocol/jest-config')

module.exports = {
  ...base,
  testPathIgnorePatterns: ['<rootDir>/__tests__/test-helpers/'],
  coverageThreshold: {
    global: {
      branches: 58,
      functions: 64,
      lines: 69,
    },
  },
}
