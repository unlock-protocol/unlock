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
]

module.exports = {
  extends: ['../.eslintrc.js'],
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
  rules: {
    'mocha/no-exclusive-tests': 'error',
    'jest/prefer-expect-assertions': 0, // Smart contract tests are using mocha...
    ...rulesToIgnore.reduce((obj, rule) => {
      return { ...obj, [rule]: 'off' }
    }, {}),
  },
}
