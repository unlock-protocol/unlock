import {
  currencySymbolForLock,
  isTooExpensiveForUser,
  isTooExpensiveForUserByCurrency,
  isEthLock,
  isERC20Lock,
} from '../../utils/locks'

import configure from '../../config'

const config = configure()

const ethLock = {
  keyPrice: '12',
}
const ethLockExpensive = {
  keyPrice: '1200',
}
const ERC20Lock = {
  currencyContractAddress: '0x123abc',
  keyPrice: '2',
}
const ERC20LockExpensive = {
  ...ERC20Lock,
  keyPrice: '9001',
}

const accountWithoutBalance = {}
const accountWithInvalidBalance = {
  balance: {
    eth: 'lmbo this string is not a float',
  },
}
const accountWithValidBalance = {
  balance: {
    eth: '42',
    '0x123abc': '9000',
  },
}
const accountWithSameBalanceAsPrice = {
  balance: {
    eth: '12',
    '0x123abc': '2',
  },
}

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

  describe('isEthLock', () => {
    it('should return true for locks that *do not* have a currencyContractAddress', () => {
      expect.assertions(1)
      expect(isEthLock(ethLock)).toBeTruthy()
    })

    it('should return false for locks that *do* have a currencyContractAddress', () => {
      expect.assertions(1)
      expect(isEthLock(ERC20Lock)).toBeFalsy()
    })
  })

  describe('isERC20Lock', () => {
    it('should return true for locks that *do* have a currencyContractAddress', () => {
      expect.assertions(1)
      expect(isERC20Lock(ERC20Lock)).toBeTruthy()
    })

    it('should return false for locks that *do not* have a currencyContractAddress', () => {
      expect.assertions(1)
      expect(isERC20Lock(ethLock)).toBeFalsy()
    })
  })

  describe('isTooExpensiveForUserByCurrency', () => {
    it('should be too expensive when there is no account', () => {
      expect.assertions(2)
      expect(
        isTooExpensiveForUserByCurrency(ethLock, undefined, 'eth')
      ).toBeTruthy()
      expect(
        isTooExpensiveForUserByCurrency(
          ERC20Lock,
          undefined,
          ERC20Lock.currencyContractAddress
        )
      ).toBeTruthy()
    })

    it('should be too expensive when there is an account but no balance', () => {
      expect.assertions(2)
      expect(
        isTooExpensiveForUserByCurrency(ethLock, accountWithoutBalance, 'eth')
      ).toBeTruthy()
      expect(
        isTooExpensiveForUserByCurrency(
          ERC20Lock,
          accountWithoutBalance,
          ERC20Lock.currencyContractAddress
        )
      ).toBeTruthy()
    })

    it('should be too expensive when there is a balance value, but it cannot be parsed', () => {
      expect.assertions(2)
      expect(
        isTooExpensiveForUserByCurrency(
          ethLock,
          accountWithInvalidBalance,
          'eth'
        )
      ).toBeTruthy()
      expect(
        isTooExpensiveForUserByCurrency(
          ERC20Lock,
          accountWithInvalidBalance,
          ERC20Lock.currencyContractAddress
        )
      ).toBeTruthy()
    })

    it('should be too expensive when there is no keyPrice on a lock', () => {
      expect.assertions(2)
      expect(
        isTooExpensiveForUserByCurrency({}, accountWithValidBalance, 'eth')
      ).toBeTruthy()
      expect(
        isTooExpensiveForUserByCurrency(
          {},
          accountWithValidBalance,
          ERC20Lock.currencyContractAddress
        )
      ).toBeTruthy()
    })

    it('should not be too expensive when the keyPrice is 0 on a lock', () => {
      expect.assertions(2)
      expect(
        isTooExpensiveForUserByCurrency(
          {
            keyPrice: '0',
          },
          accountWithValidBalance,
          'eth'
        )
      ).toBeFalsy()
      expect(
        isTooExpensiveForUserByCurrency(
          {
            keyPrice: '0',
          },
          accountWithValidBalance,
          ERC20Lock.currencyContractAddress
        )
      ).toBeFalsy()
    })

    it('should be too expensive if keyPrice is bigger than balance', () => {
      expect.assertions(2)
      expect(
        isTooExpensiveForUserByCurrency(
          ethLockExpensive,
          accountWithValidBalance,
          'eth'
        )
      ).toBeTruthy()
      expect(
        isTooExpensiveForUserByCurrency(
          ERC20LockExpensive,
          accountWithValidBalance,
          ERC20Lock.currencyContractAddress
        )
      ).toBeTruthy()
    })

    it('should be affordable if balance is the same as keyPrice', () => {
      expect.assertions(2)
      expect(
        isTooExpensiveForUserByCurrency(
          ethLock,
          accountWithSameBalanceAsPrice,
          'eth'
        )
      ).toBeFalsy()
      expect(
        isTooExpensiveForUserByCurrency(
          ERC20Lock,
          accountWithSameBalanceAsPrice,
          ERC20Lock.currencyContractAddress
        )
      ).toBeFalsy()
    })

    it('should be affordable if balance is bigger than keyPrice', () => {
      expect.assertions(2)
      expect(
        isTooExpensiveForUserByCurrency(ethLock, accountWithValidBalance, 'eth')
      ).toBeFalsy()
      expect(
        isTooExpensiveForUserByCurrency(
          ERC20Lock,
          accountWithValidBalance,
          ERC20Lock.currencyContractAddress
        )
      ).toBeFalsy()
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
