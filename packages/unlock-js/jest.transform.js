const babelConfig = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
  ],
}

module.exports = require('babel-jest').default.createTransformer(babelConfig)
