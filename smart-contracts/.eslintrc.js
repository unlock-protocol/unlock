const rulesToIgnore = [
  'no-underscore-dangle',
  'no-param-reassign',
  'no-use-before-define',
  'no-plusplus',
  'no-await-in-loop',
  'radix',
  'prefer-destructuring',
  'no-shadow',
  'no-loop-func',
  'eqeqeq',
  'no-useless-concat',
  'prefer-const',
  'no-return-await',
  'prefer-object-spread',
  '@typescript-eslint/no-var-requires',
]

module.exports = {
  extends: ['@unlock-protocol/eslint-config'],
  plugins: ['mocha'],
  globals: {
    it: true,
    artifacts: true,
    contract: true,
    describe: true,
    before: true,
    beforeEach: true,
    web3: true,
    assert: true,
    abi: true,
    after: true,
    afterEach: true,
  },
  ignorePatterns: ['coverage'],
  rules: {
    'import/extensions': 0,
    'no-unused-vars': 'error',
    'mocha/no-exclusive-tests': 'error',
    'jest/prefer-expect-assertions': 0, // Smart contract tests are using mocha...
    ...rulesToIgnore.reduce((obj, rule) => {
      return { ...obj, [rule]: 'off' }
    }, {}),
  },
}
