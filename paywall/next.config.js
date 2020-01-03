/* eslint no-console: 0 */
const fs = require('fs')
const { join } = require('path')
const { promisify } = require('util')
const withCSS = require('@zeit/next-css')
const configVariables = require('./environment')

const copyFile = promisify(fs.copyFile)

// TODO: remove this when next gets their act together
// see https://github.com/zeit/next-plugins/issues/392#issuecomment-475845330
function HACK_removeMinimizeOptionFromCssLoaders(config) {
  console.warn(
    'HACK: Removing `minimize` option from `css-loader` entries in Webpack config'
  )
  config.module.rules.forEach(rule => {
    if (Array.isArray(rule.use)) {
      rule.use.forEach(u => {
        if (u.loader === 'css-loader' && u.options) {
          delete u.options.minimize
        }
      })
    }
  })
}

module.exports = withCSS({
  publicRuntimeConfig: {
    ...configVariables,
  },
  webpack: config => {
    // Fixes npm packages that depend on `fs` module
    config.node = {
      fs: 'empty',
    }
    HACK_removeMinimizeOptionFromCssLoaders(config)

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
