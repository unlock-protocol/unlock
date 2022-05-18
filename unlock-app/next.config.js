/* eslint no-console: 0 */

const dotenv = require('dotenv')
const path = require('path')
const { exportPaths } = require('./src/utils/exportStatic')

const unlockEnv = process.env.UNLOCK_ENV || 'dev'

dotenv.config({
  path: path.resolve(__dirname, '..', `.env.${unlockEnv}.local`),
})

// TODO renames these: URLs need to be URLs, hosts need to be hosts... etc
const dev = {
  paywallUrl:
    process.env.PAYWALL_URL || 'https://staging-paywall.unlock-protocol.com',
  locksmithHost:
    process.env.LOCKSMITH_URI ||
    'https://staging-locksmith.unlock-protocol.com',
  unlockStaticUrl:
    process.env.UNLOCK_STATIC_URL || 'https://staging.unlock-protocol.com',
  wedlocksUri:
    process.env.WEDLOCKS_URI ||
    'https://wedlocks.unlock-protocol.com/.netlify/functions/handler',
}


const staging = {
  paywallUrl: 'https://staging-paywall.unlock-protocol.com',
  locksmithHost: 'https://staging-locksmith.unlock-protocol.com',
  unlockStaticUrl: 'https://staging.unlock-protocol.com',
  wedlocksUri:
    'https://wedlocks.unlock-protocol.com/.netlify/functions/handler',
}

const production = {
  locksmithHost: 'https://locksmith.unlock-protocol.com',
  unlockStaticUrl: 'https://unlock-protocol.com',
  paywallUrl: 'https://paywall.unlock-protocol.com',
  wedlocksUri:
    'https://wedlocks.unlock-protocol.com/.netlify/functions/handler',
}

function getUnlockConfig(environment) {
  switch (environment) {
    case 'prod':
      return production
    case 'staging':
      return staging
    default:
      return dev
  }
}
const unlockConfig = getUnlockConfig(unlockEnv)

const requiredConfigVariables = {
  unlockEnv,
  base64WedlocksPublicKey: process.env.BASE64_WEDLOCKS_PUBLIC_KEY,
  stripeApiKey: process.env.STRIPE_KEY,
  ...unlockConfig,
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
