/* eslint no-console: 0 */

const withTypescript = require('@zeit/next-typescript')
const { exportPaths } = require('./src/utils/exportStatic')

// TODO renames these: URLs need to be URLs, hosts need to be hosts... etc
let requiredConfigVariables = {
  unlockEnv: process.env.UNLOCK_ENV || 'dev',
  paywallUrl: process.env.PAYWALL_URL,
  paywallScriptUrl: process.env.PAYWALL_SCRIPT_URL,
  readOnlyProvider: process.env.READ_ONLY_PROVIDER,
  locksmithHost: process.env.LOCKSMITH_URI,
  wedlocksUri: process.env.WEDLOCKS_URI,
}

let optionalConfigVariables = {
  httpProvider: process.env.HTTP_PROVIDER,
}

// If any env variable is missing, fail to run, except for dev which can set its own defaults
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

module.exports = withTypescript({
  publicRuntimeConfig: {
    ...optionalConfigVariables,
    ...requiredConfigVariables,
  },
  webpack(config) {
    return config
  },
  exportPathMap: exportPaths,
})
