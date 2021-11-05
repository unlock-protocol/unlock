const base = require('@unlock-protocol/jest-config')

module.exports = {
  ...base,
  setupFiles: ['<rootDir>/.jest/env.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  coverageThreshold: {
    global: {
      branches: 54,
      functions: 53,
      lines: 81,
      statements: 74,
    },
  },
}
