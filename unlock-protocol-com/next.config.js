/* eslint no-console: 0 */
const dotenv = require('dotenv')
const path = require('path')
const { resolve } = require('path')
const { addBlogPagesToPageObject } = require('./src/utils/blog')

const unlockEnv = process.env.UNLOCK_ENV || 'dev'
const googleAnalyticsId = process.env.UNLOCK_GA_ID || '0'
dotenv.config({
  path: path.resolve(__dirname, '..', `.env.${unlockEnv}.local`),
})

let tagManagerArgs
if (unlockEnv === 'prod') {
  tagManagerArgs = {
    tagManagerArgs,
  }
}

const dev = {
  gaId: process.env.NEXT_PUBLIC_UNLOCK_GA_ID || '0',
  tagManagerArgs: {
    gaTmId: process.env.NEXT_PUBLIC_UNLOCK_GA_TM_ID || '0',
  },
  unlockApp:
    process.env.NEXT_PUBLIC_URL_BASE || 'https://staging.unlock-protocol.com',
  appURL:
    process.env.NEXT_PUBLIC_UNLOCK_APP_URL ||
    'https://staging-app.unlock-protocol.com/dashboard',
}

const staging = {
  gaId: '0',
  tagManagerArgs: {},
  unlockApp:
    process.env.UNLOCK_APP || 'https://staging-app.unlock-protocol.com',
  urlBase: process.env.URL_BASE || 'https://staging.unlock-protocol.com',
}

const production = {
  // keeping that line for legacy support
  gaId: process.env.NEXT_PUBLIC_UNLOCK_GA_ID || '0',
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
  googleAnalyticsId,
  tagManagerArgs,
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
module.exports = {
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
  exportPathMap: async (defaultPathMap, { dir }) => {
    // Our statically-defined pages to export
    const pages = {
      '/': { page: '/home' },
      '/about': { page: '/about' },
      '/jobs': { page: '/jobs' },
      '/terms': { page: '/terms' },
      '/privacy': { page: '/privacy' },
      '/blog': { page: '/blog' },
      '/membership': { page: '/membership' },
      '/developers': { page: '/developers' },
    }

    return addBlogPagesToPageObject(resolve(dir, '.'), pages)
  },
}
