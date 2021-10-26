/* eslint no-console: 0 */
const webpack = require('webpack')
var path = require('path')

const mode = process.env.UNLOCK_ENV === 'prod' ? 'production' : 'development'

module.exports = () => {
  return {
    cache: false,
    mode,
    devtool: 'source-map',
    entry: path.resolve(__dirname, 'src', 'index.ts'),
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'unlock.latest.min.js',
      library: '@unlock-protocol/paywall',
      libraryTarget: 'umd',
      umdNamedDefine: true,
      globalObject: 'this',
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
        PAYWALL_URL: JSON.stringify(process.env.PAYWALL_URL),
      }),
    ],
  }
}
