/* eslint no-console: 0 */
const fs = require('fs')
const { join } = require('path')
const { promisify } = require('util')
const withCSS = require('@zeit/next-css')
const configVariables = require('./environment')

const copyFile = promisify(fs.copyFile)

module.exports = withCSS({
  publicRuntimeConfig: {
    ...configVariables,
  },
  webpack: config => {
    // Fixes npm packages that depend on `fs` module
    config.node = {
      fs: 'empty',
    }

    // Even though next is allegedly configured to use TS by default, you still
    // have to add the typescript file extensions to webpack
    config.resolve.extensions = [...config.resolve.extensions, '.ts', '.tsx']

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
      '/newdemo': { page: '/newdemo' },
      '/checkout': { page: '/checkout' },
    }
  },
})
