module.exports = {
  extends: [
    'standard',
    'airbnb',
    'eslint:recommended',
    'plugin:react/recommended',
    'prettier',
    'prettier/react',
    'prettier/standard',
  ],
  env: {
    es6: true,
    node: true,
    browser: true,
    jest: true,
  },
  plugins: ['jest', 'mocha', 'promise', 'import'],
  parser: 'babel-eslint',
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'react/prefer-stateless-function': [2],
    'linebreak-style': ['error', 'unix'],
    quotes: [
      'error',
      'single',
      { avoidEscape: true, allowTemplateLiterals: false },
    ],
    'brace-style': 0,
    'react/forbid-prop-types': 2,
    indent: 0, // this conflicts with prettier and is not needed
    'jsx-a11y/anchor-is-valid': [
      'error',
      {
        components: ['Link'],
        specialLink: ['hrefLeft', 'hrefRight'],
        aspects: ['invalidHref', 'preferButton'],
      },
    ],
    'mocha/no-exclusive-tests': 'error',
    'react/jsx-filename-extension': [0, { extensions: ['.js', '.jsx'] }],
    'import/no-named-as-default': 0,
    'import/no-named-as-default-member': 0,
    'standard/computed-property-even-spacing': 0,
    'standard/object-curly-even-spacing': 0,
    'standard/array-bracket-even-spacing': 0,
    'promise/prefer-await-to-then': 'warn',
    'jest/no-disabled-tests': 'warn',
    'jest/no-identical-title': 'error',
    'jest/no-focused-tests': 'error',
    'jest/prefer-expect-assertions': 'error',
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      //use <root>/tsconfig.json
      typescript: {},
    },
  },
}
