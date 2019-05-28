var path = require('path')
const webpack = require('webpack')

module.exports = env => {
  return {
    mode: 'production',
    devtool: 'source-map',
    entry: path.resolve(__dirname, 'src', 'unlock.js', 'index.js'),
    output: {
      path: path.resolve(__dirname, 'src', 'static'),
      filename: 'unlock.1.0.min.js',
      globalObject: 'self',
    },

    plugins: [
      new webpack.DefinePlugin({
        'process.env.UNLOCK_ENV': "'" + env.UNLOCK_ENV + "'",
        'process.env.PAYWALL_URL': "'" + env.PAYWALL_URL + "'",
      }),
    ],
  }
}
