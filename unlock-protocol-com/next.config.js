/* eslint no-console: 0 */
const dotenv = require('dotenv')
const path = require('path')
const fs = require('fs')
const { join, resolve } = require('path')
const { promisify } = require('util')
const { addBlogPagesToPageObject } = require('./src/utils/blog')

const copyFile = promisify(fs.copyFile)

const unlockEnv = process.env.UNLOCK_ENV || 'dev'
const googleAnalyticsId = process.env.UNLOCK_GA_ID || '0'
dotenv.config({
  path: path.resolve(__dirname, '..', `.env.${unlockEnv}.local`),
})

let tagManagerArgs
if (unlockEnv === 'prod') {
  tagManagerArgs = {
    gtmId: 'GTM-ND2KDWB',
  }
}

// NOTE: do not set defaults here!
// This is a mechanism to ensure that we do not deploy code with missing/wrong
// environment variables
const requiredConfigVariables = {
  unlockEnv,
  googleAnalyticsId,
  urlBase: process.env.URL_BASE || 'https://unlock-protocol.com',
  unlockApp: process.env.UNLOCK_APP,
  tagManagerArgs,
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
