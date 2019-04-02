module.exports = {
  extends: [
    'standard',
    'airbnb',
    'eslint:recommended',
    'prettier',
    'prettier/standard',
    'plugin:prettier/recommended'
  ],
  env: {
    es6: true,
    node: true,
    browser: true,
    jest: true
  },
  plugins: ['jest', 'promise', 'import', '@typescript-eslint', 'prettier'],
  parser: '@typescript-eslint/parser',
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx']
    },
    'import/resolver': {
      // use <root>/tsconfig.json
      typescript: {}
    }
  },
  rules: {
    'prettier/prettier': 'error',
    'linebreak-style': ['error', 'unix'],
    quotes: [
      'error',
      'single',
      { avoidEscape: true, allowTemplateLiterals: false }
    ],
    'no-multiple-empty-lines': [
      'error',
      {
        max: 1,
        maxEOF: 0,
        maxBOF: 0
      }
    ],
    'brace-style': 0,
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
    'eol-last': ['error'],
    semi: ['error', 'never']
  }
}
