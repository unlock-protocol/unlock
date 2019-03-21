
describe('url test helper', () => {
  describe('main', () => {
    it('from env', () => {
      expect.assertions(2)
      process.env.UNLOCK_HOST = 'host'
      process.env.UNLOCK_PORT = 90

      // eslint-disable-next-line
      const url = require('../helpers/url')

      expect(url.main()).toBe('http://host:90/')
      expect(url.main('/test')).toBe('http://host:90/test')
    })
    it('from defaults', () => {
      expect.assertions(2)
      process.env.UNLOCK_HOST = false
      process.env.UNLOCK_PORT = false

      // eslint-disable-next-line
      const url = require('../helpers/url')

      expect(url.main()).toBe('http://127.0.0.1:3000/')
      expect(url.main('/test')).toBe('http://127.0.0.1:3000/test')
    })
  })
  describe('paywall', () => {

  })
})
