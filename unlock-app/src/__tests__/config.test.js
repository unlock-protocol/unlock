import configure, { inIframe } from '../config'

describe('config', () => {
  describe('inIframe', () => {
    it('should return false when self == top', () => {
      expect.assertions(1)
      const window = {}
      window.self = window
      window.top = window
      expect(inIframe(window)).toBe(false)
    })

    it('should return true when self != top', () => {
      expect.assertions(1)
      const window = {
        self: 'nope',
        top: 'yes',
      }
      expect(inIframe(window)).toBe(true)
    })

    it('should return true when an exception is thrown', () => {
      expect.assertions(1)
      expect(inIframe()).toBe(true)
    })
  })

  describe('isInIframe', () => {
    it('should return false when self == top', () => {
      expect.assertions(1)
      const window = {}
      window.self = window
      window.top = window

      const config = configure(
        {
          unlockEnv: 'dev',
          httpProvider: '127.0.0.1',
        },
        window
      )

      expect(config.isInIframe).toBe(false)
    })

    it('should return true when self != top', () => {
      expect.assertions(1)
      const window = {
        self: 'nope',
        top: 'yes',
      }

      const config = configure(
        {
          unlockEnv: 'dev',
          httpProvider: '127.0.0.1',
        },
        window
      )

      expect(config.isInIframe).toBe(true)
    })

    it('should return true when an exception is thrown', () => {
      expect.assertions(1)
      const config = configure(
        {
          unlockEnv: 'dev',
          httpProvider: '127.0.0.1',
        },
        null
      )

      expect(config.isInIframe).toBe(true)
    })
  })
})
