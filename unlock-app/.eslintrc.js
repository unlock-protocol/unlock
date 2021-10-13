const rulesToIgnore = [
  'no-unused-vars',
  'no-console',
  'no-restricted-globals',
  'radix',
  'eqeqeq',
  'no-underscore-dangle',
  'class-methods-use-this',
  'no-throw-literal',
  'no-param-reassign',
  'consistent-return',
  'camelcase',
  'no-plusplus',
  'no-dupe-keys',
  'no-prototype-builtins',
  'no-shadow',
  'prefer-destructuring',
  'no-return-assign',
  'global-require',
  'no-nested-ternary',
  'no-use-before-define',
  'array-callback-return',
  'no-unused-expressions',
  'default-case',
  'no-useless-constructor',
  'prefer-promise-reject-errors',
  'no-restricted-syntax',
  'guard-for-in',
  'no-async-promise-executor',
  '@typescript-eslint/no-unused-vars',
]

module.exports = {
  extends: [
    '@unlock-protocol/eslint-config', 
    'plugin:react/recommended'
  ],
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
