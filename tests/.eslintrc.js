module.exports = {
    "extends": [
        "standard",
        "eslint:recommended",
        "airbnb-base",
    ],
    "env": {
        "es6": true,
        "node": true,
        "browser": true,
        "jest": true
    },
    globals: {
        page: true,
        browser: true,
        context: true,
        jestPuppeteer: true,
    },
    "rules": {
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
        "comma-dangle": [2, "always-multiline"],
        "eol-last": [
            "error"
        ],
    }
};