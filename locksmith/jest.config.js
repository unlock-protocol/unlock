require('./src/utils/envLoader')

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  testPathIgnorePatterns: ['<rootDir>/__tests__/test-helpers/'],
  coverageThreshold: {
    global: {
      branches: 57,
      functions: 62,
      lines: 65,
    },
  },
  preset: 'ts-jest/presets/js-with-ts', // or other ESM presets
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testEnvironment: 'node',
}
