const rulesToIgnore = [
  'eqeqeq',
  'no-use-before-define',
  'no-shadow',
  'radix',
  'no-restricted-globals',
  'no-throw-literal',
  'radix',
  'no-unused-expressions',
  'global-require',
  'class-methods-use-this',
  'no-return-await',
  'camelcase',
  'consistent-return',
  'no-param-reassign',
  'no-await-in-loop',
  'no-restricted-syntax',
  'no-else-return',
  'object-shorthand',
]

module.exports = {
  extends: ['../.eslintrc.js'],
  rules: {
    ...rulesToIgnore.reduce((obj, rule) => {
      return { ...obj, [rule]: 'off' }
    }, {}),
  },
}
