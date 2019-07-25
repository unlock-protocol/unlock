/* eslint no-console: 0 */
const dotenv = require('dotenv')
const path = require('path')
const fs = require('fs')
const { join, resolve } = require('path')
const { promisify } = require('util')
const withTypescript = require('@zeit/next-typescript')
const { addBlogPagesToPageObject } = require('./src/utils/blog')

const copyFile = promisify(fs.copyFile)

const unlockEnv = process.env.UNLOCK_ENV || 'dev'
const googleAnalyticsId = process.env.UNLOCK_GA_ID || '0'

dotenv.config({
  path: path.resolve(__dirname, '..', `.env.${unlockEnv}.local`),
})

let requiredConfigVariables = {
  unlockEnv,
  googleAnalyticsId,
  dashboardUrl: process.env.DASHBOARD_URL,
  intercomAppId: 'f99d98d3', // Hardcoded for now
}

Object.keys(requiredConfigVariables).forEach(configVariableName => {
  if (!requiredConfigVariables[configVariableName]) {
    if (requiredConfigVariables.unlockEnv === 'test') return
    if (requiredConfigVariables.unlockEnv === 'dev') {
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
      // Commented out because _redirects folder has been removed
      // TODO: Determine if this is needed at all
      // await copyFile(
      //   join(dir, 'static', '_redirects'),
      //   join(outDir, '_redirects')
      // )
    }

    // Our statically-defined pages to export
    let pages = {
      '/': { page: '/home' },
      '/about': { page: '/about' },
      '/jobs': { page: '/jobs' },
      '/terms': { page: '/terms' },
      '/privacy': { page: '/privacy' },
      '/blog': { page: '/blog' },
    }

    return addBlogPagesToPageObject(resolve(dir, '..'), pages)
  },
})
