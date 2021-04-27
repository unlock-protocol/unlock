/* eslint no-console: 0 */

const dotenv = require('dotenv')
const path = require('path')
const { exportPaths } = require('./src/utils/exportStatic')

const unlockEnv = process.env.UNLOCK_ENV || 'dev'

dotenv.config({
  path: path.resolve(__dirname, '..', `.env.${unlockEnv}.local`),
})

// TODO renames these: URLs need to be URLs, hosts need to be hosts... etc
const requiredConfigVariables = {
  unlockEnv,
  paywallUrl: process.env.PAYWALL_URL,
  paywallScriptUrl: process.env.PAYWALL_SCRIPT_URL,
  readOnlyProvider: process.env.READ_ONLY_PROVIDER, // Used for Unlock Accounts
  locksmithHost: process.env.LOCKSMITH_URI,
  wedlocksUri: process.env.WEDLOCKS_URI,
  unlockStaticUrl: process.env.UNLOCK_STATIC_URL,
  base64WedlocksPublicKey: process.env.BASE64_WEDLOCKS_PUBLIC_KEY,
  stripeApiKey: process.env.STRIPE_KEY,
  subgraphURI: process.env.SUBGRAPH_URI,
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
