const rulesToIgnore = [
  'prefer-const',
  'consistent-return',
  'no-param-reassign',
  'no-use-before-define',
  'radix',
  'no-restricted-globals',
  'eqeqeq',
  'no-underscore-dangle',
  'class-methods-use-this',
  'no-throw-literal',
  'no-nested-ternary',
  'no-shadow',
  'no-dupe-keys',
  'no-return-assign',
  'prefer-destructuring',
  'no-plusplus',
  'array-callback-return',
  'react/prop-types',
  'no-unused-expressions',
  'no-useless-constructor',
  'max-classes-per-file',
  'prefer-promise-reject-errors',
]

module.exports = {
  extends: [
    '../.eslintrc.js',
  ],
  plugins: ['react-hooks'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'react/prefer-stateless-function': [2],
    'react/forbid-prop-types': 2,
    'jsx-a11y/anchor-is-valid': [
      'error',
      {
        components: ['Link'],
        specialLink: ['hrefLeft', 'hrefRight'],
        aspects: ['invalidHref', 'preferButton'],
      },
    ],
    'react/jsx-filename-extension': [0, { extensions: ['.js', '.jsx'] }],
    ...rulesToIgnore.reduce((obj, rule) => {
      return { ...obj, [rule]: 'off' }
    }, {}),
  },
}
