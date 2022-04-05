const rulesToIgnore = [
  'import/no-extraneous-dependencies',
  'no-underscore-dangle',
  'no-param-reassign',
  'class-methods-use-this',
  'no-shadow',
  'eqeqeq',
  'consistent-return',
  'no-use-before-define',
  'no-return-assign',
  'no-return-await',
  'no-plusplus',
  'prefer-destructuring',
  'radix',
  'no-async-promise-executor',
  'no-promise-executor-return',
  'default-param-last',
  'prefer-promise-reject-errors',
  'prefer-const',
  'no-dupe-class-members',
]

module.exports = {
  extends: ['@unlock-protocol/eslint-config'],
  rules: {
    ...rulesToIgnore.reduce((obj, rule) => {
      return { ...obj, [rule]: 'off' }
    }, {}),
    '@typescript-eslint/no-dupe-class-members': ['error'],
  },
}
