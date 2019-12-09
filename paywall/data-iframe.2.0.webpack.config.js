/* eslint no-console: 0 */
var path = require('path')
const webpack = require('webpack')
const configVariables = require('./environment')

module.exports = () => {
  return {
    cache: false,
    mode: 'production',
    devtool: 'source-map',
    entry: path.resolve(__dirname, 'src', 'data-iframe', 'index.2.0.ts'),
    output: {
      path: path.resolve(__dirname, 'src', 'static'),
      filename: 'data-iframe.2.0.min.js',
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    plugins: [
      new webpack.DefinePlugin({
        __ENVIRONMENT_VARIABLES__: JSON.stringify(configVariables),
      }),
    ],
  }
}
