describe('exportStatic', () => {
  beforeEach(() => {
    jest.resetModules()

    jest.mock('fs', () => ({
      copyFileSync: jest.fn(() => {}),
    }))
  })

  it('should copy files when not in dev mode', async () => {
    expect.assertions(7)

    const { copyFileSync } = require('fs')
    const { moveStaticFiles } = require('../../utils/exportStatic')
    moveStaticFiles(false, '/foo/bar', '/alice/bob')

    expect(copyFileSync.mock.calls.length).toBe(3)
    expect(copyFileSync.mock.calls[0][0]).toBe('/foo/bar/static/robots.txt')
    expect(copyFileSync.mock.calls[0][1]).toBe('/alice/bob/robots.txt')
    expect(copyFileSync.mock.calls[1][0]).toBe('/foo/bar/static/humans.txt')
    expect(copyFileSync.mock.calls[1][1]).toBe('/alice/bob/humans.txt')
    expect(copyFileSync.mock.calls[2][0]).toBe('/foo/bar/static/_redirects')
    expect(copyFileSync.mock.calls[2][1]).toBe('/alice/bob/_redirects')
  })

  it('should not copy files when in dev mode', () => {
    expect.assertions(1)

    const { copyFileSync } = require('fs')
    const { moveStaticFiles } = require('../../utils/exportStatic')
    moveStaticFiles(true, '/foo/bar', '/alice/bob')

    expect(copyFileSync.mock.calls.length).toBe(0)
  })

  it('should generate path map', () => {
    expect.assertions(1)
    const { exportPaths } = require('../../utils/exportStatic')

    const paths = exportPaths({}, { dev: true, dir: '/foo', outDir: '/bar' })

    expect(paths).toEqual({
      '/': { page: '/home' },
      '/account': { page: '/account' },
      '/dashboard': { page: '/dashboard' },
      '/keychain': { page: '/keyChain' },
      '/log': { page: '/log' },
      '/login': { page: '/login' },
      '/signup': { page: '/signup' },
      '/settings': { page: '/settings' },
    })
  })
})
