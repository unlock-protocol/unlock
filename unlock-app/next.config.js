const fs = require('fs')
const { join } = require('path')
const { promisify } = require('util')
const withSourceMaps = require('@zeit/next-source-maps')

const copyFile = promisify(fs.copyFile)

module.exports = withSourceMaps({
  publicRuntimeConfig: {
    unlockEnv: process.env.UNLOCK_ENV || 'dev',
    httpProvider: process.env.HTTP_PROVIDER || '127.0.0.1',
  },
  webpack(config) {
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
      '/': { page: '/' },
      '/about': { page: '/about' },
      '/jobs': { page: '/jobs' },
      '/dashboard': { page: '/dashboard' },
      '/paywall': { page: '/paywall' },
      '/demo': { page: '/demo' },
    }
  },
})
