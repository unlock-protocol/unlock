require('./src/utils/envLoader')
const base = require('@unlock-protocol/jest-config')

module.exports = {
  ...base,
  testPathIgnorePatterns: ['<rootDir>/__tests__/test-helpers/'],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 70,
      lines: 69,
    },
  },
}
