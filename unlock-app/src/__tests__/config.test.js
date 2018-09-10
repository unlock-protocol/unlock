import configure from '../config'

describe('config', () => {

  describe('dev', () => {
    let config = configure(global)

    it('should require a dev network', () => {
      expect(config.isRequiredNetwork(0)).toEqual(false)
      expect(config.isRequiredNetwork(1)).toEqual(false)
      expect(config.isRequiredNetwork(4)).toEqual(false)
      expect(config.isRequiredNetwork(1337)).toEqual(true)
    })

    it('should have the right keys in dev', () => {
      expect(config.requiredNetwork).toEqual('Dev')
      expect(config.providers).toEqual({
        HTTP: {
          connected: false,
          headers: undefined,
          host: 'http://127.0.0.1:8545',
          timeout: 0,
        },
      })
    })

    it('should have the right keys in dev when there is a web3 provider', () => {
      config = configure({
        web3: {
          currentProvider: {
            isMetaMask: true,
          },
        },
        location: {
          hostname: 'localhost',
        },
      })
      expect(config.providers).toEqual({
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
    let config = configure({
      web3: {
        currentProvider: {
          isMetaMask: true,
        },
      },
      location: {
        hostname: 'staging.unlock-protocol.com',
      },
    })

    it('should require rinkeby', () => {
      expect(config.isRequiredNetwork(0)).toEqual(false)
      expect(config.isRequiredNetwork(1)).toEqual(false)
      expect(config.isRequiredNetwork(4)).toEqual(true)
      expect(config.isRequiredNetwork(1337)).toEqual(false)
    })

    it('should have the right keys ', () => {
      expect(config.requiredNetwork).toEqual('Rinkeby')
      expect(config.providers).toEqual({
        Metamask: {
          isMetaMask: true,
        },
      })
    })
  })

  describe('production', () => {
    let config = configure({
      location: {
        hostname: 'unlock-protocol.com',
      },
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
