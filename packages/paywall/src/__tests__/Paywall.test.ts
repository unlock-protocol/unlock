import 'jest-fetch-mock'
import { Enabler } from '../utils/enableInjectedProvider'
import * as isUnlockedUtil from '../utils/isUnlocked'
import * as optimisticUnlockingUtils from '../utils/optimisticUnlocking'

import { Paywall } from '../Paywall'
import * as paywallScriptUtils from '../utils'
import { networkConfigs } from '../networkConfigs'


const paywallConfig = {
  network: 31337, // test network
  callToAction: {
    default: 'default',
    expired: 'expired',
    pending: 'pending',
    confirmed: 'confirmed',
    noWallet: 'noWallet',
    metadata: 'metadata',
  },
  locks: {
    '0x1234567890123456789012345678901234567890': {
      name: 'A Lock',
    },
  },
  icon: 'http://com.com/image.tiff',
  useDelegatedProvider: false,
}

const testLock = Object.keys(paywallConfig.locks)[0]
const now = new Date().toDateString()
const savedTransactions = [
  {
    recipient: testLock,
    transactionHash: '0xtransaction',
    createdAt: now,
    updatedAt: now,
    chain: 0,
    sender: '0xuser',
    for: '0xfor',
    data: '0xdata',
  },
]

let paywall: Paywall;

describe('Paywall object', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    paywall = new Paywall(paywallConfig, networkConfigs)
    paywall.unlockPage = jest.fn()
    paywall.lockPage = jest.fn()
  })

  it('is constructed with one call in the buffer to set the config', () => {
    expect.assertions(2)

    expect(paywall.childCallBuffer).toHaveLength(1)

    // Constuctor will update config with provider info
    const expectedConfig = paywallScriptUtils.injectProviderInfo(paywallConfig)

    expect(paywall.childCallBuffer[0]).toEqual(['setConfig', expectedConfig])
  })

  describe('userInfo event', () => {
    it('caches the user key info and checks the status', async () => {
      expect.assertions(3)

      paywall.cacheUserInfo = jest.fn()
      paywall.checkKeysAndLock = jest.fn()

      await paywall.handleUserInfoEvent({ address: '0xtheaddress' })
      expect(paywall.cacheUserInfo).toHaveBeenCalledWith({
        address: '0xtheaddress',
      })
      expect(paywall.checkKeysAndLock).toHaveBeenCalledWith()
      expect(paywall.userAccountAddress).toBe('0xtheaddress')
    })

    it('should dispatch an event', async () => {
      expect.assertions(1)

      jest.spyOn(paywallScriptUtils, 'dispatchEvent')

      paywall.unlockPage = jest.fn()

      await paywall.handleUserInfoEvent({ address: '0xtheaddress' })
      expect(paywallScriptUtils.dispatchEvent).toHaveBeenCalledWith(
        paywallScriptUtils.unlockEvents.authenticated,
        {
          address: '0xtheaddress',
        }
      )
    })
  })

  describe('methodCall event', () => {
    it('forwards the method call to the injected provider', async () => {
      expect.assertions(2)

      const provider = {
        enable: jest.fn(),
        sendAsync: jest.fn(),
      }

      paywall.provider = provider as Enabler

      await paywall.handleMethodCallEvent({
        method: 'net_version',
        params: [],
        id: 31337,
      })

      expect(provider.enable).toHaveBeenCalledWith()
      expect(provider.sendAsync).toHaveBeenCalledWith(
        {
          method: 'net_version',
          params: [],
          id: 31337,
        },
        expect.any(Function)
      )
    })
  })

  describe('checkKeysAndLock', () => {
    it('should return without locking or unlocking if the account is not set', async () => {
      expect.assertions(2)
      paywall.userAccountAddress = undefined

      await paywall.checkKeysAndLock()
      expect(paywall.unlockPage).not.toHaveBeenCalled()
      expect(paywall.lockPage).not.toHaveBeenCalled()
    })

    it('should call isUnlocked and unlockPage the page if it yields a lock address', async () => {
      expect.assertions(2)
      jest.spyOn(isUnlockedUtil, 'isUnlocked').mockResolvedValueOnce([testLock])
      jest
        .spyOn(optimisticUnlockingUtils, 'getTransactionsForUserAndLocks')
        .mockImplementationOnce(() => Promise.resolve(savedTransactions))

      await paywall.checkKeysAndLock()
      expect(paywall.unlockPage).toHaveBeenCalledWith([testLock])
      expect(paywall.lockPage).not.toHaveBeenCalled()
    })

    it('should call isUnlocked and lockPage the page if it yields no lock address', async () => {
      expect.assertions(2)
      jest.spyOn(isUnlockedUtil, 'isUnlocked').mockResolvedValueOnce([])
      paywall.userAccountAddress = '0xUser'

      await paywall.checkKeysAndLock()
      expect(paywall.unlockPage).not.toHaveBeenCalled()
      expect(paywall.lockPage).toHaveBeenCalled()
    })
  })

  describe('transactionInfo', () => {
    it('should try to optimistically unlock', async () => {
      expect.assertions(2)

      jest
        .spyOn(optimisticUnlockingUtils, 'willUnlock')
        .mockResolvedValueOnce(true)

      paywall.unlockPage = jest.fn()

      await paywall.handleTransactionInfoEvent({
        hash: '0xhash',
        lock: '0xlock',
      })
      expect(optimisticUnlockingUtils.willUnlock).toHaveBeenCalledWith(
        'http://127.0.0.1:8545',
        '0xtheaddress',
        '0xlock',
        '0xhash',
        true
      )
      expect(paywall.unlockPage).toHaveBeenCalled()
    })

    it('should dispatch an event', async () => {
      expect.assertions(1)

      jest.spyOn(paywallScriptUtils, 'dispatchEvent')

      paywall.unlockPage = jest.fn()

      await paywall.handleTransactionInfoEvent({
        hash: '0xhash',
        lock: '0xlock',
      })
      expect(paywallScriptUtils.dispatchEvent).toHaveBeenCalledWith(
        paywallScriptUtils.unlockEvents.transactionSent,
        {
          hash: '0xhash',
          lock: '0xlock',
        }
      )
    })

    it('should not try to optimistically unlock if the config has a pessimistic field', async () => {
      expect.assertions(1)
      const pessimisticConfig = {
        ...paywallConfig,
        pessimistic: true,
      }
      const paywall = new Paywall(pessimisticConfig, networkConfigs)

      jest
        .spyOn(optimisticUnlockingUtils, 'willUnlock')
        .mockResolvedValueOnce(true)

      paywall.lockPage = jest.fn()

      await paywall.handleTransactionInfoEvent({
        hash: '0xhash',
        lock: '0xlock',
      })
      expect(optimisticUnlockingUtils.willUnlock).not.toHaveBeenCalled()
    })
  })
})

describe('Paywall unlockPage', () => {
  beforeEach(() => {
    paywall = new Paywall(paywallConfig, networkConfigs)
  })

  it('should dispatch an event for lock status', async () => {
    expect.assertions(1)
    jest.spyOn(paywallScriptUtils, 'dispatchEvent')
    paywall.unlockPage([testLock])
    expect(paywallScriptUtils.dispatchEvent).toHaveBeenCalledWith(
      paywallScriptUtils.unlockEvents.status,
      {
        locks: [testLock],
        state: 'unlocked',
      }
    )
  })
})
