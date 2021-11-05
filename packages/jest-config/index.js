const path = require('path');
const glob = require('glob');

const rootPath = path.resolve('../..')

const ignore = [
  '**/node_modules/**',
  '**/docker/**',
  '**/build/**',
  '<rootDir>/.next/',
  '<rootDir>/__tests__/test-helpers/',
]

const projects = glob.sync(`${rootPath}/**/jest.config.js`, {
  ignore
}).map( d=> d.replace(rootPath, '<rootDir>'))

module.exports = {
  preset: "ts-jest",
  moduleFileExtensions: [
    "ts",
    "tsx",
    "js",
    "jsx",
    "json",
    "node"
  ],
  preset: 'ts-jest/presets/js-with-ts',
  testPathIgnorePatterns: [
    "/node_modules/",
    "<rootDir>/node_modules/",
    '<rootDir>/.next/',
    '<rootDir>/__tests__/test-helpers/',
  ],
  transformIgnorePatterns: [
    '[/\\\\]node_modules[/\\\\](?!(ethereum-cryptography)).+\\.(js|jsx|ts|tsx)$',
  ],
  collectCoverage: true,
  coveragePathIgnorePatterns: ["/node_modules/"],
};

