/* eslint no-console: 0 */
const dotenv = require('dotenv')
const path = require('path')
const fs = require('fs')
const { join } = require('path')
const { promisify } = require('util')
const withTypescript = require('@zeit/next-typescript')
const withCSS = require('@zeit/next-css')

const unlockEnv = process.env.UNLOCK_ENV || 'dev'

dotenv.config({
  path: path.resolve(__dirname, '..', `.env.${unlockEnv}.local`),
})

const copyFile = promisify(fs.copyFile)

const requiredConfigVariables = {
  unlockEnv,
  readOnlyProvider: process.env.READ_ONLY_PROVIDER,
  locksmithUri: process.env.LOCKSMITH_URI,
  wedlocksUri: process.env.WEDLOCKS_URI,
  unlockTicketsUrl: process.env.UNLOCK_TICKETS_URL,
  erc20ContractSymbol: process.env.ERC20_CONTRACT_SYMBOL,
  erc20ContractAddress: process.env.ERC20_CONTRACT_ADDRESS,
}

const optionalConfigVariables = {
  httpProvider: process.env.HTTP_PROVIDER,
}

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

module.exports = withTypescript(
  withCSS({
    publicRuntimeConfig: {
      ...optionalConfigVariables,
      ...requiredConfigVariables,
    },
    webpack: config => {
      // Fixes npm packages that depend on `fs` module
      config.node = {
        fs: 'empty',
      }

      return config
    },
    exportPathMap: async (defaultPathMap, { dev, dir, outDir }) => {
      // Export robots.txt and humans.txt in non-dev environments
      if (!dev && outDir) {
        await copyFile(
          join(dir, 'static', 'robots.txt'),
          join(outDir, 'robots.txt')
        )

        await copyFile(
          join(dir, 'static', 'humans.txt'),
          join(outDir, 'humans.txt')
        )

        // Export _redirects which is used by netlify for URL rewrites
        await copyFile(
          join(dir, 'static', '_redirects'),
          join(outDir, '_redirects')
        )
      }

      return {
        '/': { page: '/home' },
        '/create': { page: '/create' },
        '/event': { page: '/event' },
        '/checkin': { page: '/checkin' },
        '/newevent': { page: '/newevent' },
      }
    },
  })
)
