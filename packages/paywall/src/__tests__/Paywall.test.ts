import { vi } from 'vitest'
import { Enabler } from '../utils/enableInjectedProvider'
import * as isUnlockedUtil from '../utils/isUnlocked'
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

describe('Paywall object', () => {
  let paywall: Paywall

  beforeEach(() => {
    localStorage.clear()
    vi.resetAllMocks()
    paywall = new Paywall(paywallConfig, networkConfigs)
    paywall.unlockPage = vi.fn()
    paywall.lockPage = vi.fn()
  })

  it('is constructed with with no buffered call', () => {
    expect.assertions(1)
    expect(paywall.childCallBuffer).toHaveLength(0)
  })

  describe('userInfo event', () => {
    it('caches the user key info and checks the status', async () => {
      expect.assertions(3)

      paywall.cacheUserInfo = vi.fn()
      paywall.checkKeysAndLock = vi.fn()

      await paywall.handleUserInfoEvent({ address: '0xtheaddress' })
      expect(paywall.cacheUserInfo).toHaveBeenCalledWith({
        address: '0xtheaddress',
      })
      expect(paywall.checkKeysAndLock).toHaveBeenCalledWith()
      expect(paywall.userAccountAddress).toBe('0xtheaddress')
    })

    it('should dispatch an event', async () => {
      expect.assertions(1)

      vi.spyOn(paywallScriptUtils, 'dispatchEvent')

      paywall.unlockPage = vi.fn()

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
      expect.assertions(1)

      const provider = {
        enable: vi.fn(),
        sendAsync: vi.fn(),
      }

      paywall.provider = provider as Enabler

      await paywall.handleMethodCallEvent({
        method: 'net_version',
        params: [],
        id: 31337,
      })

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
    let paywall: Paywall
    beforeEach(() => {
      vi.resetAllMocks()
      paywall = new Paywall(paywallConfig, networkConfigs)
      paywall.unlockPage = vi.fn()
      paywall.lockPage = vi.fn()
    })

    it('should return without locking or unlocking if the account is not set', async () => {
      expect.assertions(2)
      paywall.userAccountAddress = undefined

      await paywall.checkKeysAndLock()
      expect(paywall.unlockPage).not.toHaveBeenCalled()
      expect(paywall.lockPage).not.toHaveBeenCalled()
    })

    it('should call isUnlocked and unlockPage the page if it yields a lock address', async () => {
      expect.assertions(2)
      paywall.userAccountAddress = '0xUser'
      vi.spyOn(isUnlockedUtil, 'isUnlocked').mockResolvedValueOnce([testLock])

      await paywall.checkKeysAndLock()
      expect(paywall.unlockPage).toHaveBeenCalledWith([testLock])
      expect(paywall.lockPage).not.toHaveBeenCalled()
    })

    it('should call isUnlocked and lockPage the page if it yields no lock address', async () => {
      expect.assertions(2)
      vi.spyOn(isUnlockedUtil, 'isUnlocked').mockResolvedValueOnce([])
      paywall.userAccountAddress = '0xUser'

      await paywall.checkKeysAndLock()
      expect(paywall.unlockPage).not.toHaveBeenCalled()
      expect(paywall.lockPage).toHaveBeenCalled()
    })
  })

  describe('transactionInfo', () => {
    it('should try to optimistically unlock', async () => {
      expect.assertions(1)
      paywall.userAccountAddress = '0xtheaddress'

      paywall.unlockPage = vi.fn()

      await paywall.handleTransactionInfoEvent({
        hash: '0xhash',
        lock: '0xlock',
      })

      expect(paywall.unlockPage).toHaveBeenCalled()
    })

    it('should dispatch an event', async () => {
      expect.assertions(1)

      vi.spyOn(paywallScriptUtils, 'dispatchEvent')

      paywall.unlockPage = vi.fn()

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
  })

  describe('Paywall unlockPage', () => {
    beforeEach(() => {
      paywall = new Paywall(paywallConfig, networkConfigs)
    })

    it('should dispatch an event for lock status', async () => {
      expect.assertions(1)
      vi.spyOn(paywallScriptUtils, 'dispatchEvent')
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
})
