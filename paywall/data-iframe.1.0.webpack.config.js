const dotenv = require('dotenv')
var path = require('path')
const webpack = require('webpack')
const requireEnvVariables = require('./requireEnvVariables')

// Important: call this first so that builds fail if any env variable is missing
const requiredConfigVariables = requireEnvVariables({
  readOnlyProvider: process.env.READ_ONLY_PROVIDER,
  locksmithUri: process.env.LOCKSMITH_URI,
  paywallUrl: process.env.PAYWALL_URL,
})

const unlockEnv = process.env.UNLOCK_ENV || 'dev'
const debug = process.env.DEBUG ? 1 : 0

dotenv.config({
  path: path.resolve(__dirname, '..', `.env.${unlockEnv}.local`),
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
        'process.env.DEBUG': debug,
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
