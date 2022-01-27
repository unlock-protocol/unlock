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
  'func-names',
  'import/extensions',
  'jest/prefer-expect-assertions',
  'import/no-extraneous-dependencies',
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
  rules: {
    'mocha/no-exclusive-tests': 'error',
    ...rulesToIgnore.reduce((obj, rule) => {
      return { ...obj, [rule]: 'off' }
    }, {}),
  },
}
