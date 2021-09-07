const rulesToIgnore = [
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
  'prefer-promise-reject-errors',
  'prefer-const',
]

module.exports = {
  extends: ['@unlock-protocol/eslint-config'],
  rules: {
    ...rulesToIgnore.reduce((obj, rule) => {
      return { ...obj, [rule]: 'off' }
    }, {}),
  },
}
