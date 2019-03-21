process.env.UNLOCK_HOST = 'host'
process.env.UNLOCK_PORT = 999
process.env.PAYWALL_URL = 'http://whatever'
const url = require('../helpers/url')

describe('url test helper, from environment', () => {
  it('main', () => {
    expect(url.main()).toBe('http://host:999/')
    expect(url.main('/path')).toBe('http://host:999/path')
  })
})
