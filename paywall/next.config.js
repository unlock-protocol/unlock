const fs = require('fs')
const { join } = require('path')
const { promisify } = require('util')
const withSourceMaps = require('@zeit/next-source-maps')
const withCSS = require('@zeit/next-css')

const copyFile = promisify(fs.copyFile)

module.exports = withSourceMaps(
  withCSS({
    publicRuntimeConfig: {
      unlockEnv: process.env.UNLOCK_ENV || 'dev',
      httpProvider: process.env.HTTP_PROVIDER || '127.0.0.1',
      readOnlyProvider: process.env.READ_ONLY_PROVIDER,
      paywallUrl: process.env.PAYWALL_URL,
      paywallScriptPath: process.env.PAYWALL_SCRIPT_PATH,
      locksmithHost: process.env.LOCKSMITH_URI || 'http://127.0.0.1:8080',
      unlockAddress:
        process.env.UNLOCK_ADDRESS ||
        '0x885EF47c3439ADE0CB9b33a4D3c534C99964Db93', // default for CI
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
        '/paywall': { page: '/paywall' },
        '/demo': { page: '/demo' },
      }
    },
  })
)
