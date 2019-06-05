const dotenv = require('dotenv')
var path = require('path')
const webpack = require('webpack')
const requireEnvVariables = require('./requireEnvVariables')

// Important: call this first so that builds fail if any env variable is missing
const requiredConfigVariables = requireEnvVariables({
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
