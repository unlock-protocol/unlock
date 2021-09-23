const rulesToIgnore = [
  'no-unused-vars',
  'no-prototype-builtins',
  'no-restricted-globals',
  'eqeqeq',
  'radix',
  'consistent-return',
  'no-use-before-define',
  'no-param-reassign',
  'block-scoped-var',
  'no-var',
  'vars-on-top',
  'no-underscore-dangle',
  'class-methods-use-this',
  'max-classes-per-file',
  'no-unused-expressions',
  'no-plusplus',
  'no-nested-ternary',
  'prefer-const',
  'no-shadow',
  'camelcase',
  'no-return-assign',
  'no-new',
  'prefer-promise-reject-errors',
  'array-callback-return',
  'prefer-destructuring',
  'default-case',
]

module.exports = {
  extends: ['@unlock-protocol/eslint-config', 'plugin:react/recommended'],
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
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    ...rulesToIgnore.reduce((obj, rule) => {
      return { ...obj, [rule]: 'off' }
    }, {}),
  },
}
