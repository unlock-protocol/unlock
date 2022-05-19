const { join } = require('path')

/**
 * Exports static files and generates a path map, as used by next.config.js
 * @param {{}} defaultPathMap
 * @param {bool} dev
 * @param {string} dir
 * @param {string} outDir
 * @returns {{}}
 */
const exportPaths = (defaultPathMap, { dev, dir, outDir }) => {
  // Our statically-defined pages to export
  return {
    '/': { page: '/home' },
    '/dashboard': { page: '/dashboard' },
    '/demo': { page: '/demo' },
    '/keychain': { page: '/keychain' },
    '/login': { page: '/login' },
    '/signup': { page: '/signup' },
    '/settings': { page: '/settings' },
    '/recover': { page: '/recover' },
    '/clone': { page: '/clone' },
    '/verification': { page: '/verification' },
    '/members': { page: '/members' },
    '/checkout': { page: '/checkout' },
    '/verifiers': { page: '/verifiers' },
  }
}

module.exports = {
  exportPaths,
}
