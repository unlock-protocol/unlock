/* eslint no-console: 0 */
const dotenv = require('dotenv')
const path = require('path')
const withCSS = require('@zeit/next-css')

const unlockEnv = process.env.UNLOCK_ENV || 'dev'

dotenv.config({
  path: path.resolve(__dirname, '..', `.env.${unlockEnv}.local`),
})

const requiredConfigVariables = {
  unlockEnv,
  locksmithUri: process.env.LOCKSMITH_URI,
  unlockAppUrl: process.env.UNLOCK_APP_URL,
  unlockStaticUrl: process.env.UNLOCK_STATIC_URL,
  paywallUrl: process.env.PAYWALL_URL,
}

Object.keys(requiredConfigVariables).forEach((configVariableName) => {
  if (!requiredConfigVariables[configVariableName]) {
    if (['dev', 'test'].indexOf(requiredConfigVariables.unlockEnv) > -1) {
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

module.exports = withCSS({
  publicRuntimeConfig: {
    ...requiredConfigVariables,
  },
  exportPathMap: async () => {
    return {
      '/': { page: '/' },
    }
  },
})
