require('./src/utils/envLoader')
const base = require('@unlock-protocol/jest-config')

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  ...base,
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],
  coverageThreshold: {
    global: {
      branches: 57,
      functions: 62,
      lines: 65,
    },
  },
  testEnvironment: 'node',
}
