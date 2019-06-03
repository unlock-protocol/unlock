/* eslint no-console: 0 */
var path = require('path')
const webpack = require('webpack')
const dotenv = require('dotenv')

const unlockEnv = process.env.UNLOCK_ENV || 'dev'

dotenv.config({
  path: path.resolve(__dirname, '..', `.env.${unlockEnv}.local`),
})

const requiredConfigVariables = {
  unlockEnv,
  readOnlyProvider: process.env.READ_ONLY_PROVIDER,
  locksmithUri: process.env.LOCKSMITH_URI,
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
    entry: path.resolve(__dirname, 'src', 'data-iframe', 'index.js'),
    output: {
      path: path.resolve(__dirname, 'src', 'static'),
      filename: 'data-iframe.1.0.min.js',
      globalObject: 'self',
    },

    plugins: [
      new webpack.DefinePlugin({
        'process.env.UNLOCK_ENV': "'" + unlockEnv + "'",
        'process.env.PAYWALL_URL':
          "'" + requiredConfigVariables.paywallUrl + "'",
        'process.env.LOCKSMITH_URI':
          "'" + requiredConfigVariables.locksmithUri + "'",
        'process.env.READ_ONLY_PROVIDER':
          "'" + requiredConfigVariables.readOnlyProvider + "'",
      }),
    ],
  }
}
