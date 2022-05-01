require('./src/utils/envLoader')
const base = require('@unlock-protocol/jest-config')

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  ...base,
  testPathIgnorePatterns: ['<rootDir>/__tests__/test-helpers/'],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],
  coverageThreshold: {
    global: {
      branches: 56.5,
      functions: 62,
      lines: 65,
    },
  },
}
