module.exports = {
  "extends": ["standard", "eslint:recommended", "plugin:react/recommended"],
  "settings": {
    "react": {
      "createClass": "createReactClass", // Regex for Component Factory to use,
                                         // default to "createReactClass"
      "pragma": "React",  // Pragma to use, default to "React"
      "version": "16.4", // React version, default to the latest React stable release
    },
    "propWrapperFunctions": [ "forbidExtraProps" ] // The names of any functions used to wrap the
                                                   // propTypes object, e.g. `forbidExtraProps`.
                                                   // If this isn't set, any propTypes wrapped in
                                                   // a function will be skipped.
  },
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
