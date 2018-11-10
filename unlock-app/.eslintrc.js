module.exports = {
  "extends": [
    "standard",
    "airbnb",
    "eslint:recommended",
    "plugin:react/recommended",
  ],
  "env": {
    "es6": true,
    "node": true,
    "browser": true,
    "jest": true
  },
  "parser": "babel-eslint",
  "rules": {
    "react/jsx-wrap-multilines": false,
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
    ],
    "jsx-a11y/anchor-is-valid": [
      "error", {
        "components": [ "Link" ],
        "specialLink": [ "hrefLeft", "hrefRight" ],
        "aspects": [ "invalidHref", "preferButton" ]
      }
    ],
    "react/jsx-filename-extension": [0, { "extensions": [".js", ".jsx"] }], 
    "import/no-named-as-default": 0,
    "import/no-named-as-default-member": 0
  }
};