import { currencySymbolForLock, isTooExpensiveForUser } from '../../utils/locks'

import configure from '../../config'

const config = configure()

describe('locks utilities', () => {
  describe('currencySymbolForLock', () => {
    it('should return Eth by default', () => {
      expect.assertions(1)
      const lock = {}
      expect(currencySymbolForLock(lock, config)).toBe('Eth')
    })

    it('should returnt the symbol if one exists', () => {
      expect.assertions(1)
      const lock = {
        currencySymbol: 'cDAI',
      }
      expect(currencySymbolForLock(lock, config)).toBe('cDAI')
    })

    it('should return the configs symbold if this is an ERC20 matching the config', () => {
      expect.assertions(1)
      const lock = {
        currencyContractAddress: config.erc20Contract.address,
      }
      expect(currencySymbolForLock(lock, config)).toBe(
        config.erc20Contract.name
      )
    })

    it('should return ERC20 for all other ERC20', () => {
      expect.assertions(1)
      const lock = {
        currencyContractAddress: '0xMyERC20',
      }
      expect(currencySymbolForLock(lock, config)).toBe('ERC20')
    })
  })

  describe('isTooExpensiveForUser', () => {
    it('should return true for locks in ether when the user does not have enough', () => {
      expect.assertions(1)
      const expensiveLock = {
        keyPrice: '1000',
      }
      const poorUser = {
        balance: {
          eth: '10',
        },
      }
      expect(isTooExpensiveForUser(expensiveLock, poorUser)).toBe(true)
    })

    it('should return true for locks in erc20 when the user does not have enough', () => {
      expect.assertions(1)
      const expensiveLock = {
        currencyContractAddress: '0xErc20',
        keyPrice: '1000',
      }
      const poorUser = {
        balance: {
          [expensiveLock.currencyContractAddress]: '1',
        },
      }
      expect(isTooExpensiveForUser(expensiveLock, poorUser)).toBe(true)
    })

    it('should return false for locks in ether when the user does have enough', () => {
      expect.assertions(1)
      const cheapLock = {
        keyPrice: '10',
      }
      const richUser = {
        balance: {
          eth: '1000',
        },
      }
      expect(isTooExpensiveForUser(cheapLock, richUser)).toBe(false)
    })

    it('should return false for locks in erc20 when the user does have enough', () => {
      expect.assertions(1)
      const cheapLock = {
        currencyContractAddress: '0xErc20',
        keyPrice: '10',
      }
      const richUser = {
        balance: {
          [cheapLock.currencyContractAddress]: '1000',
        },
      }
      expect(isTooExpensiveForUser(cheapLock, richUser)).toBe(false)
    })
  })
})
