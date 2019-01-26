const fs = require('fs')
const { join } = require('path')
const { promisify } = require('util')
const withSourceMaps = require('@zeit/next-source-maps')

const copyFile = promisify(fs.copyFile)
const { runtimeConfig } = require('./src/config')

module.exports = withSourceMaps({
  publicRuntimeConfig: runtimeConfig,
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
      '/terms': { page: '/terms' },
      '/privacy': { page: '/privacy' },
    }
  },
})
