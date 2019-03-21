delete process.env.UNLOCK_HOST
delete process.env.UNLOCK_PORT
delete process.env.PAYWALL_URL
const url = require('../helpers/url')

describe('url test helper, default values', () => {
  it('main', () => {
    expect(url.main()).toBe('http://127.0.0.1:3000/')
    expect(url.main('/path')).toBe('http://127.0.0.1:3000/path')
  })
  it('paywall', () => {
    expect(url.paywall()).toBe('http://127.0.0.1:3001/')
    expect(url.paywall('/path')).toBe('http://127.0.0.1:3001/path')
  })
})
