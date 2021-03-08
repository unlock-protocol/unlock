import {
  lockKeysAvailable,
  lockTickerSymbol,
  userCanAffordKey,
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

      expect(lockTickerSymbol(lock, 'ETH')).toEqual('ETH')
    })

    it('returns DAI when it is a DAI lock', () => {
      expect.assertions(1)
      const lock = {
        currencyContractAddress: '0xDAI',
        currencySymbol: 'DAI',
      }

      expect(lockTickerSymbol(lock, 'ETH')).toEqual('DAI')
    })

    it('returns ERC20 when it is an unknown ERC20 lock', () => {
      expect.assertions(1)
      const lock = {
        currencyContractAddress: '0xDAI',
      }

      expect(lockTickerSymbol(lock, 'ETH')).toEqual('ERC20')
    })
  })

  describe('userCanAffordKey', () => {
    const balances = {
      eth: '50',
      '0x123abc': '50',
    }

    it('returns true when the user has enough eth', () => {
      expect.assertions(1)

      const lock = {
        keyPrice: '0.01',
        currencyContractAddress: null,
      }

      expect(userCanAffordKey(lock, '50')).toBeTruthy()
    })

    it('returns true when the user has enough erc20', () => {
      expect.assertions(1)

      const lock = {
        keyPrice: '0.01',
        currencyContractAddress: '0x123abc',
      }

      expect(userCanAffordKey(lock, '50')).toBeTruthy()
    })

    it('returns true when the user has exactly the right amount of erc20', () => {
      expect.assertions(1)

      const lock = {
        keyPrice: balances['0x123abc'],
        currencyContractAddress: '0x123abc',
      }

      expect(userCanAffordKey(lock, '50')).toBeTruthy()
    })

    it('returns false when the user has insufficient eth', () => {
      expect.assertions(1)

      const lock = {
        keyPrice: '100',
        currencyContractAddress: null,
      }

      expect(userCanAffordKey(lock, '50')).toBeFalsy()
    })

    it('returns false when the user has exactly the right amount of eth', () => {
      expect.assertions(1)

      const lock = {
        keyPrice: balances.eth,
        currencyContractAddress: null,
      }

      expect(userCanAffordKey(lock, '50')).toBeFalsy()
    })

    it('returns false when the user has insufficient erc20', () => {
      expect.assertions(1)

      const lock = {
        keyPrice: '100',
        currencyContractAddress: '0x123abc',
      }

      expect(userCanAffordKey(lock, '50')).toBeFalsy()
    })

    it('returns false when the key price cannot be parsed', () => {
      expect.assertions(1)

      const lock = {
        keyPrice: '100qq',
        currencyContractAddress: '0x123abc',
      }

      expect(userCanAffordKey(lock, '50')).toBeFalsy()
    })

    it('returns false when the balance cannot be parsed', () => {
      expect.assertions(1)

      const lock = {
        keyPrice: '100',
        currencyContractAddress: '0xnotintheobject',
      }

      expect(userCanAffordKey(lock, '50')).toBeFalsy()
    })
  })
})
