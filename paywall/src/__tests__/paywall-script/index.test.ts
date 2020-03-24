import { Paywall } from '../../paywall-script/index'
import * as timeStampUtil from '../../utils/keyExpirationTimestampFor'
import * as optimisticUnlockingUtils from '../../utils/optimisticUnlocking'

declare let __ENVIRONMENT_VARIABLES__: any
// eslint-disable-next-line no-undef
const { readOnlyProvider } = __ENVIRONMENT_VARIABLES__

const paywallConfig = {
  callToAction: {
    default: 'default',
    expired: 'expired',
    pending: 'pending',
    confirmed: 'confirmed',
  },
  locks: {
    '0x1234567890123456789012345678901234567890': {
      name: 'A Lock',
    },
  },
  icon: 'http://com.com/image.tiff',
}

let paywall: Paywall

describe('Paywall init script', () => {
  beforeEach(() => {
    paywall = new Paywall(paywallConfig)
    paywall.unlockPage = jest.fn()
    paywall.lockPage = jest.fn()
  })

  it('is constructed with one call in the buffer to set the config', () => {
    expect.assertions(2)

    expect(paywall.childCallBuffer).toHaveLength(1)

    expect(paywall.childCallBuffer[0]).toEqual(['setConfig', paywallConfig])
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
  })

  describe('checkKeysAndLock', () => {
    it('unlocks the page if some key expiration timestamp is in the future', async () => {
      expect.assertions(1)
      paywall.userAccountAddress = '0xtheaddress'
      const futureTime = new Date().getTime() / 1000 + 50000
      jest
        .spyOn(timeStampUtil, 'keyExpirationTimestampFor')
        .mockResolvedValueOnce(futureTime)

      await paywall.checkKeysAndLock()

      expect(paywall.unlockPage).toHaveBeenCalled()
    })

    describe('when all key expiration timestamps are in the past', () => {
      beforeEach(() => {
        paywall.userAccountAddress = '0xtheaddress'
        const futureTime = new Date().getTime() / 1000 - 50000
        jest
          .spyOn(timeStampUtil, 'keyExpirationTimestampFor')
          .mockResolvedValueOnce(futureTime)
      })

      it('checks whether the we should be optimistic for any past and unlock if it yields true', async () => {
        expect.assertions(2)

        jest
          .spyOn(optimisticUnlockingUtils, 'optimisticUnlocking')
          .mockResolvedValueOnce(true)

        await paywall.checkKeysAndLock()

        expect(paywall.lockPage).not.toHaveBeenCalled()
        expect(paywall.unlockPage).toHaveBeenCalled()
      })

      it('checks whether we should be optimistic for any past transaction and lock if it yields false', async () => {
        expect.assertions(2)

        jest
          .spyOn(optimisticUnlockingUtils, 'optimisticUnlocking')
          .mockResolvedValueOnce(false)

        await paywall.checkKeysAndLock()

        expect(paywall.lockPage).toHaveBeenCalled()
        expect(paywall.unlockPage).not.toHaveBeenCalled()
      })
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
        readOnlyProvider,
        undefined,
        '0xlock',
        '0xhash',
        true
      )
      expect(paywall.unlockPage).toHaveBeenCalled()
    })
  })
})
