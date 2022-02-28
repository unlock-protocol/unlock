/* eslint no-console: 0 */
const dotenv = require('dotenv')
const path = require('path')

const unlockEnv = process.env.UNLOCK_ENV || 'dev'
dotenv.config({
  path: path.resolve(__dirname, '..', `.env.${unlockEnv}.local`),
})

const dev = {
  googleAnalyticsId: process.env.UNLOCK_GA_ID || '0',
  tagManagerArgs: {},
  urlBase: process.env.URL_BASE || 'https://unlock-protocol.com',
  unlockApp:
    process.env.UNLOCK_APP ||
    'https://staging-app.unlock-protocol.com/dashboard',
}

const staging = {
  googleAnalyticsId: '0',
  tagManagerArgs: {},
  unlockApp: 'https://staging-app.unlock-protocol.com',
  urlBase: 'https://staging.unlock-protocol.com',
}

const production = {
  // keeping that line for legacy support
  googleAnalyticsId: process.env.UNLOCK_GA_ID || '0',
  tagManagerArgs: {
    gtmId: 'GTM-ND2KDWB',
  },
  unlockApp: 'https://app.unlock-protocol.com',
  urlBase: 'https://unlock-protocol.com',
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

// This is a mechanism to ensure that we do not deploy code with missing/wrong
// environment variables
const requiredConfigVariables = {
  unlockEnv,
  ...unlockConfig,
}

Object.keys(requiredConfigVariables).forEach((configVariableName) => {
  if (!requiredConfigVariables[configVariableName]) {
    if (requiredConfigVariables.unlockEnv === 'test') return
    if (requiredConfigVariables.unlockEnv === 'dev') {
      console.error(
        `The configuration variable ${configVariableName} is falsy.`
      )
      return
    }
    throw new Error(
      `The configuration variable ${configVariableName} is falsy.`
    )
  }
})

const nextConfig = {
  publicRuntimeConfig: requiredConfigVariables,
  webpack(config) {
    config.module.rules.push({
      test: /\.md$/,
      use: 'raw-loader',
    })
    config.module.rules.push({
      test: /blog\.index/,
      use: 'raw-loader',
    })
    return config
  },
}

module.exports = nextConfig
