/* eslint no-console: 0 */
const fs = require('fs')
const { join } = require('path')
const { promisify } = require('util')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const copyFile = promisify(fs.copyFile)

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  webpack: (config) => {
    // Despite being mostly Typescript-configured by default, Next
    // will fail to resolve .ts{x} files if we don't set the
    // resolvers.
    config.resolve.extensions = [...config.resolve.extensions, '.ts', '.tsx']

    // output the js lib
    const unlockJSFile = require.resolve('@unlock-protocol/paywall')
    config.plugins.push(
      new CopyWebpackPlugin({
        patterns: [
          {
            from: unlockJSFile,
            to: join(__dirname, 'src/static/unlock.latest.min.js'),
          },
        ],
      })
    )

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

      // Export s3config.json which is used by s3 for URL rewrites
      await copyFile(
        join(dir, 'static', 's3config.json'),
        join(outDir, 's3config.json')
      )
    }

    return {
      '/': { page: '/home' },
    }
  },
})
