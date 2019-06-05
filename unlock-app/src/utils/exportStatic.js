const { copyFileSync } = require('fs')
const { join } = require('path')

/**
 * Exports useful files from the static folder to the root deployment
 * @param {bool} dev Are we in dev mode or not?
 * @param {string} inDir The incoming root folder
 * @param {string} outDir The outgoing root folder
 * @returns {Promise<void>}
 */
const moveStaticFiles = async (dev, inDir, outDir) => {
  // Export robots.txt and humans.txt in non-dev environments
  if (!dev && outDir) {
    copyFileSync(
      join(inDir, 'static', 'robots.txt'),
      join(outDir, 'robots.txt')
    )
    copyFileSync(
      join(inDir, 'static', 'humans.txt'),
      join(outDir, 'humans.txt')
    )
    // Export _redirects which is used by netlify for URL rewrites
    copyFileSync(
      join(inDir, 'static', '_redirects'),
      join(outDir, '_redirects')
    )
  }
}

/**
 * Exports static files and generates a path map, as used by next.config.js
 * @param {{}} defaultPathMap
 * @param {bool} dev
 * @param {string} dir
 * @param {string} outDir
 * @returns {{}}
 */
const exportPaths = (defaultPathMap, { dev, dir, outDir }) => {
  moveStaticFiles(dev, dir, outDir)

  // Our statically-defined pages to export
  return {
    '/': { page: '/home' },
    '/dashboard': { page: '/dashboard' },
    '/keychain': { page: '/keyChain' },
    '/login': { page: '/login' },
    '/signup': { page: '/signup' },
    '/log': { page: '/log' },
    '/settings': { page: '/settings' },
  }
}

module.exports = {
  moveStaticFiles,
  exportPaths,
}
