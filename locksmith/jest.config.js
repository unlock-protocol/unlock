require('./src/utils/envLoader')
const base = require('@unlock-protocol/jest-config')

const ignored = ['<rootDir>/__tests__/test-helpers/', '<rootDir>/build/']

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  ...base,
  testPathIgnorePatterns: ignored,
  coveragePathIgnorePatterns: ignored,
  modulePathIgnorePatterns: ignored,
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 62,
      lines: 65,
    },
  },
}
