module.exports = {
  output: 'export',
  exportPathMap: async () => {
    return {
      '/': { page: '/home' },
    }
  },
}
