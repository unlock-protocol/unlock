import configure, { inIframe } from '../config'

describe('config', () => {
  describe('inIframe', () => {
    it('should return false when self == top', () => {
      const window = {}
      window.self = window
      window.top = window
      expect(inIframe(window)).toBe(false)
    })
    it('should return true when self != top', () => {
      const window = {
        self: 'nope',
        top: 'yes',
      }
      expect(inIframe(window)).toBe(true)
    })
    it('should return true when an exception is thrown', () => {
      expect(inIframe()).toBe(true)
    })
  })

  describe('isInIframe', () => {
    it('should return false when self == top', () => {
      const window = {}
      window.self = window
      window.top = window

      const config = configure(
        global,
        {
          unlockEnv: 'dev',
          httpProvider: '127.0.0.1',
        },
        window
      )

      expect(config.isInIframe).toBe(false)
    })
    it('should return true when self != top', () => {
      const window = {
        self: 'nope',
        top: 'yes',
      }

      const config = configure(
        global,
        {
          unlockEnv: 'dev',
          httpProvider: '127.0.0.1',
        },
        window
      )

      expect(config.isInIframe).toBe(true)
    })
    it('should return true when an exception is thrown', () => {
      const config = configure(
        global,
        {
          unlockEnv: 'dev',
          httpProvider: '127.0.0.1',
        },
        null
      )

      expect(config.isInIframe).toBe(true)
    })
  })
  describe('dev', () => {
    let config = configure(global, {
      unlockEnv: 'dev',
      httpProvider: '127.0.0.1',
    })

    it('should require a dev network', () => {
      expect(config.isRequiredNetwork(0)).toEqual(false)
      expect(config.isRequiredNetwork(1)).toEqual(false)
      expect(config.isRequiredNetwork(4)).toEqual(false)
      expect(config.isRequiredNetwork(1984)).toEqual(true)
    })

    it('should have the right keys in dev', () => {
      expect(config.requiredNetwork).toEqual('Dev')
      expect(config.providers).toMatchObject({
        HTTP: {
          connected: false,
          headers: undefined,
          host: 'http://127.0.0.1:8545',
          timeout: 0,
        },
      })
    })

    it('should have the right keys in dev when there is a web3 provider', () => {
      config = configure(
        {
          web3: {
            currentProvider: {
              isMetaMask: true,
            },
          },
        },
        {
          unlockEnv: 'dev',
          httpProvider: '127.0.0.1',
        }
      )
      expect(config.providers).toMatchObject({
        HTTP: {
          connected: false,
          headers: undefined,
          host: 'http://127.0.0.1:8545',
          timeout: 0,
        },
        Metamask: {
          isMetaMask: true,
        },
      })
    })
  })

  describe('staging', () => {
    let config = configure(
      {
        web3: {
          currentProvider: {
            isMetaMask: true,
          },
        },
      },
      {
        unlockEnv: 'staging',
        httpProvider: '127.0.0.1',
      }
    )

    it('should require rinkeby', () => {
      expect(config.isRequiredNetwork(0)).toEqual(false)
      expect(config.isRequiredNetwork(1)).toEqual(false)
      expect(config.isRequiredNetwork(4)).toEqual(true)
      expect(config.isRequiredNetwork(1337)).toEqual(false)
    })

    it('should have the right keys ', () => {
      expect(config.requiredNetwork).toEqual('Rinkeby')
      expect(config.providers).toMatchObject({
        Metamask: {
          isMetaMask: true,
        },
      })
    })
  })

  describe('production', () => {
    let config = configure(global, {
      unlockEnv: 'prod',
      httpProvider: '127.0.0.1',
    })

    it('should require mainnet', () => {
      expect(config.isRequiredNetwork(0)).toEqual(false)
      expect(config.isRequiredNetwork(1)).toEqual(true)
      expect(config.isRequiredNetwork(4)).toEqual(false)
      expect(config.isRequiredNetwork(1337)).toEqual(false)
    })

    it('should have the right keys in production', () => {
      expect(config.requiredNetwork).toEqual('Mainnet')
      expect(config.providers).toEqual({}) // We miss a web3 provider!
    })
  })
})
