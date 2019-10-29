/* eslint no-console: 0 */
var path = require('path')
const webpack = require('webpack')
const configVariables = require('./environment')

module.exports = () => {
  return {
    cache: false,
    mode: 'production',
    devtool: 'source-map',
    entry: path.resolve(__dirname, 'src', 'unlock.js', 'index.ts'),
    output: {
      path: path.resolve(__dirname, 'src', 'static'),
      filename: 'unlock.1.0.min.js',
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.tsx?$/,
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
