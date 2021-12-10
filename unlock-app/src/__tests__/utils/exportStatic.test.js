describe('exportStatic', () => {
  beforeEach(() => {
    jest.resetModules()

    jest.mock('fs', () => ({
      copyFileSync: jest.fn(() => {}),
    }))
  })

  it('should generate path map', () => {
    expect.assertions(1)
    const { exportPaths } = require('../../utils/exportStatic')

    const paths = exportPaths({}, { dev: true, dir: '/foo', outDir: '/bar' })

    expect(paths).toEqual({
      '/': { page: '/home' },
      '/dashboard': { page: '/dashboard' },
      '/demo': { page: '/demo' },
      '/keychain': { page: '/keychain' },
      '/login': { page: '/login' },
      '/signup': { page: '/signup' },
      '/clone': { page: '/clone' },
      '/settings': { page: '/settings' },
      '/recover': { page: '/recover' },
      '/verification': { page: '/verification' },
      '/members': { page: '/members' },
      '/checkout': { page: '/checkout' },
    })
  })
})
