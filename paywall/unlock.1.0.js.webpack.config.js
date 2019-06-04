/* eslint no-console: 0 */
const dotenv = require('dotenv')
var path = require('path')
const webpack = require('webpack')

const unlockEnv = process.env.UNLOCK_ENV
const debug = process.env.DEBUG ? 1 : 0

dotenv.config({
  path: path.resolve(__dirname, '..', `.env.${unlockEnv || 'dev'}.local`),
})

const requiredConfigVariables = {
  unlockEnv: process.env.UNLOCK_ENV,
  paywallUrl: process.env.PAYWALL_URL,
}

Object.keys(requiredConfigVariables).forEach(configVariableName => {
  if (!requiredConfigVariables[configVariableName]) {
    if (['dev', 'test'].indexOf(requiredConfigVariables.unlockEnv) > -1) {
      return console.error(
        `The configuration variable ${configVariableName} is falsy.`
      )
    }
    throw new Error(
      `The configuration variable ${configVariableName} is falsy.`
    )
  }
})

module.exports = () => {
  return {
    mode: 'production',
    devtool: 'source-map',
    entry: path.resolve(__dirname, 'src', 'unlock.js', 'index.js'),
    output: {
      path: path.resolve(__dirname, 'src', 'static'),
      filename: 'unlock.1.0.min.js',
      globalObject: 'self',
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.UNLOCK_ENV': "'" + unlockEnv + "'",
        'process.env.DEBUG': debug,
        'process.env.PAYWALL_URL':
          "'" + requiredConfigVariables.paywallUrl + "'",
      }),
    ],
  }
}
