module.exports = {
  output: 'export',
  distDir: 'out',
  exportPathMap: async () => {
    return {
      '/': { page: '/home' },
    }
  },
}
