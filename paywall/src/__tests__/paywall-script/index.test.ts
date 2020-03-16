import { Paywall } from '../../paywall-script/index'
import * as timeStampUtil from '../../utils/keyExpirationTimestampFor'

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
      paywall.unlockPage = jest.fn()
      const futureTime = new Date().getTime() / 1000 + 50000
      jest
        .spyOn(timeStampUtil, 'keyExpirationTimestampFor')
        .mockResolvedValue(futureTime)

      await paywall.checkKeysAndLock()

      expect(paywall.unlockPage).toHaveBeenCalled()
    })

    it('does not unlock the page if all key expiration timestamps are in the past', async () => {
      expect.assertions(1)
      paywall.userAccountAddress = '0xtheaddress'
      paywall.unlockPage = jest.fn()
      const futureTime = new Date().getTime() / 1000 - 50000
      jest
        .spyOn(timeStampUtil, 'keyExpirationTimestampFor')
        .mockResolvedValue(futureTime)

      await paywall.checkKeysAndLock()

      expect(paywall.unlockPage).not.toHaveBeenCalled()
    })
  })
})
