/* eslint no-console: 0 */

const dotenv = require('dotenv')
const path = require('path')
const { exportPaths } = require('./src/utils/exportStatic')

const unlockEnv = process.env.UNLOCK_ENV || 'dev'

dotenv.config({
  path: path.resolve(__dirname, '..', `.env.${unlockEnv}.local`),
})

// TODO renames these: URLs need to be URLs, hosts need to be hosts... etc
const staging = {
  locksmithHost: 'https://rinkeby.locksmith.unlock-protocol.com',
  unlockStaticUrl: 'https://unlock-protocol.com',
  unlockAppUrl: 'https://staging-app.unlock-protocol.com',
  paywallUrl: 'https://staging-paywall.unlock-protocol.com',
}

const production = {
  locksmithHost: 'https://locksmith.unlock-protocol.com',
  unlockStaticUrl: 'https://unlock-protocol.com',
  unlockAppUrl: 'https://app.unlock-protocol.com',
  paywallUrl: 'https://paywall.unlock-protocol.com',
}

const envConfig = unlockEnv === 'prod' ? production : staging

const requiredConfigVariables = {
  unlockEnv,
  base64WedlocksPublicKey: process.env.BASE64_WEDLOCKS_PUBLIC_KEY,
  stripeApiKey: process.env.STRIPE_KEY,
  wedlocksUri:
    'https://wedlocks.unlock-protocol.com/.netlify/functions/handler',
  ...envConfig,
}

const optionalConfigVariables = {
  httpProvider: process.env.HTTP_PROVIDER,
}
// If any env variable is missing, fail to run, except for dev which can set its own defaults
Object.keys(requiredConfigVariables).forEach((configVariableName) => {
  if (!requiredConfigVariables[configVariableName]) {
    if (
      ['dev', 'dev-kovan', 'test'].indexOf(requiredConfigVariables.unlockEnv) >
      -1
    ) {
      return console.error(
        `The configuration variable ${configVariableName} is falsy.`
      )
    }
    throw new Error(
      `The configuration variable ${configVariableName} is falsy.`
    )
  }
})

module.exports = {
  publicRuntimeConfig: {
    ...optionalConfigVariables,
    ...requiredConfigVariables,
  },
  webpack(config) {
    config.resolve.extensions = [...config.resolve.extensions, '.ts', '.tsx']
    return config
  },
  exportPathMap: exportPaths,
}
