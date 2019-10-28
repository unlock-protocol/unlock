/* eslint no-console: 0 */
var path = require('path')
const webpack = require('webpack')

const configVariables = require('./environment')

module.exports = () => {
  return {
    cache: false,
    mode: 'none',
    devtool: 'source-map',
    entry: path.resolve(__dirname, 'src', 'unlock.js', 'module.ts'),
    output: {
      library: 'unlock-web',
      libraryTarget: 'commonjs2',
      path: path.resolve(__dirname, 'src', 'unlock.js', 'dist'),
      filename: 'index.js',
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            { loader: 'style-loader', options: { injectType: 'lazyStyleTag' } },
            'css-loader',
          ],
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
