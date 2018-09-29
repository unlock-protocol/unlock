module.exports = {
  "extends": ["standard", "eslint:recommended", "plugin:react/recommended"],
  "env": {
    "es6": true,
    "node": true,
    "browser": true,
    "jest": true
  },
  globals: {},
  rules: {
    "react/prefer-stateless-function": [2],
    "indent": [
      "error",
      2
    ],
    "linebreak-style": [
      "error",
      "unix"
    ],
    "quotes": [
      "error",
      "single"
    ],
    "semi": [
      "error",
      "never"
    ],
    "no-multiple-empty-lines": [
      "error", {
        "max": 1,
        "maxEOF": 0,
        "maxBOF": 0
      }
    ],
    "brace-style": [2, "1tbs", { "allowSingleLine": true }],
    "react/forbid-prop-types": 2,
    "comma-dangle": [2, "always-multiline"],
    "eol-last": [
      "error"
    ]
  }
};
