import {
  lockKeysAvailable,
  lockTickerSymbol,
} from '../../utils/checkoutLockUtils'

describe('Checkout Lock Utils', () => {
  describe('lockKeysAvailable', () => {
    it('returns Unlimited if it has unlimited keys', () => {
      expect.assertions(1)
      const lock = {
        unlimitedKeys: true,
        maxNumberOfKeys: -1,
        outstandingKeys: 100,
      }
      expect(lockKeysAvailable(lock)).toEqual('Unlimited')
    })

    it('returns the difference between max and outstanding ottherwise', () => {
      expect.assertions(1)
      const lock = {
        maxNumberOfKeys: 203,
        outstandingKeys: 100,
      }
      expect(lockKeysAvailable(lock)).toEqual('103')
    })
  })

  describe('lockTickerSymbol', () => {
    it('returns ETH when it is an ETH lock', () => {
      expect.assertions(1)
      const lock = {
        currencyContractAddress: null,
      }

      expect(lockTickerSymbol(lock)).toEqual('ETH')
    })

    it('returns DAI when it is a DAI lock', () => {
      expect.assertions(1)
      const lock = {
        currencyContractAddress: '0xDAI',
        currencySymbol: 'DAI',
      }

      expect(lockTickerSymbol(lock)).toEqual('DAI')
    })

    it('returns ERC20 when it is an unknown ERC20 lock', () => {
      expect.assertions(1)
      const lock = {
        currencyContractAddress: '0xDAI',
      }

      expect(lockTickerSymbol(lock)).toEqual('ERC20')
    })
  })
})
