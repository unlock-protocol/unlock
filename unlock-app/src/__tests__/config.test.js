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

  describe('dev', () => {
    const config = configure({
      unlockEnv: 'dev',
      httpProvider: '127.0.0.1',
    })

    it('should require a dev network', () => {
      expect.assertions(4)
      expect(config.isRequiredNetwork(0)).toEqual(false)
      expect(config.isRequiredNetwork(1)).toEqual(false)
      expect(config.isRequiredNetwork(4)).toEqual(false)
      expect(config.isRequiredNetwork(1984)).toEqual(true)
    })

    it('should have the right keys in dev', () => {
      expect.assertions(1)
      expect(config.requiredNetwork).toEqual('Dev')
    })

    it('should contain the right URLs for chain explorers', () => {
      expect.assertions(2)
      expect(Object.keys(config.chainExplorerUrlBuilders)).toHaveLength(1)
      expect(config.chainExplorerUrlBuilders.etherScan('0x0')).toEqual('')
    })
  })

  describe('staging', () => {
    const config = configure({
      unlockEnv: 'staging',
      httpProvider: '127.0.0.1',
    })

    it('should require rinkeby', () => {
      expect.assertions(4)
      expect(config.isRequiredNetwork(0)).toEqual(false)
      expect(config.isRequiredNetwork(1)).toEqual(false)
      expect(config.isRequiredNetwork(4)).toEqual(true)
      expect(config.isRequiredNetwork(1337)).toEqual(false)
    })

    it('should have the right keys ', () => {
      expect.assertions(1)
      expect(config.requiredNetwork).toEqual('Rinkeby')
    })

    it('should contain the right URLs for chain explorers', () => {
      expect.assertions(2)
      expect(Object.keys(config.chainExplorerUrlBuilders)).toHaveLength(1)
      expect(config.chainExplorerUrlBuilders.etherScan('0x0')).toEqual(
        'https://rinkeby.etherscan.io/address/0x0'
      )
    })
  })

  describe('production', () => {
    const config = configure({
      unlockEnv: 'prod',
      httpProvider: '127.0.0.1',
    })

    it('should require mainnet', () => {
      expect.assertions(4)
      expect(config.isRequiredNetwork(0)).toEqual(false)
      expect(config.isRequiredNetwork(1)).toEqual(true)
      expect(config.isRequiredNetwork(4)).toEqual(false)
      expect(config.isRequiredNetwork(1337)).toEqual(false)
    })

    it('should have the right keys in production', () => {
      expect.assertions(1)
      expect(config.requiredNetwork).toEqual('Mainnet')
    })

    it('should contain the right URLs for chain explorers', () => {
      expect.assertions(2)
      expect(Object.keys(config.chainExplorerUrlBuilders)).toHaveLength(1)
      expect(config.chainExplorerUrlBuilders.etherScan('0x0')).toEqual(
        'https://etherscan.io/address/0x0'
      )
    })
  })
})
