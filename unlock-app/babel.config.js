module.exports = {
  "env": {
    "development": {
      "presets": [
        "next/babel"
      ],
      "plugins": [
        [
          "styled-components",
          {
            "ssr": true,
            "displayName": true,
            "preprocess": false
          }
        ]
      ]
    },
    "production": {
      "presets": [
        "next/babel"
      ],
      "plugins": [
        [
          "styled-components",
          {
            "ssr": true,
            "displayName": false,
            "preprocess": false
          }
        ]
      ]
    },
    "test": {
      "presets": [
        [
          "next/babel",
          {
            "preset-env": {
              "modules": "commonjs"
            }
          }
        ]
      ],
      "plugins": [
        [
          "styled-components",
          {
            "ssr": true,
            "displayName": false,
            "preprocess": false
          }
        ],
        [
          "require-context-hook"
        ]
      ]
    }
  }
}
