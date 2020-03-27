/* eslint no-console: 0 */
const webpack = require('webpack')
var path = require('path')

module.exports = () => {
  return {
    cache: false,
    mode: 'development',
    devtool: 'source-map',
    entry: path.resolve(__dirname, 'module.js'),
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'module.js',
      library: '@unlock-protocol/paywall',
      libraryTarget: 'umd',
      umdNamedDefine: true,
      globalObject: 'this',
    },
    module: {
      rules: [
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
        fetch: "require('node-fetch')",
      }),
    ],
  }
}
