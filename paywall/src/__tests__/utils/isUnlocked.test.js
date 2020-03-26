import { isUnlocked } from '../../utils/isUnlocked'
import * as optimisticUtil from '../../utils/optimisticUnlocking'
import * as timeStampUtil from '../../utils/keyExpirationTimestampFor'

const {
  readOnlyProvider,
  locksmithUri,
} = __ENVIRONMENT_VARIABLES__ /* eslint no-undef: 0 */

const userAccountAddress = '0xUser'
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
    '0x7C5af12cFcbAAd7893351B41a6DF251d67fD310D': {
      name: 'Another Lock',
    },
  },
  icon: 'http://com.com/image.tiff',
}

describe('isUnlocked', () => {
  describe('when the user has a valid key to any of the locks', () => {
    it('should check each locks', async () => {
      expect.assertions(4)
      const futureTime = new Date().getTime() / 1000 + 50000
      const spy = jest
        .spyOn(timeStampUtil, 'keyExpirationTimestampFor')
        .mockResolvedValue(futureTime)

      const unlocked = await isUnlocked(userAccountAddress, paywallConfig, {
        readOnlyProvider,
        locksmithUri,
      })
      expect(unlocked).toBe(true)

      expect(spy).toHaveBeenCalledTimes(2)
      expect(spy).toHaveBeenNthCalledWith(
        1,
        readOnlyProvider,
        Object.keys(paywallConfig.locks)[0],
        userAccountAddress
      )
      expect(spy).toHaveBeenNthCalledWith(
        2,
        readOnlyProvider,
        Object.keys(paywallConfig.locks)[1],
        userAccountAddress
      )
    })
  })

  describe('when the user does not have a valid key to any of the locks', () => {
    beforeEach(() => {
      const pastTime = new Date().getTime() / 1000 - 50000
      jest
        .spyOn(timeStampUtil, 'keyExpirationTimestampFor')
        .mockResolvedValue(pastTime)
    })
    describe('when the user has a pending transaction for which we should be optimistic', () => {
      it('should return true', async () => {
        expect.assertions(2)
        const spy = jest
          .spyOn(optimisticUtil, 'optimisticUnlocking')
          .mockResolvedValue(true)

        const unlocked = await isUnlocked(userAccountAddress, paywallConfig, {
          readOnlyProvider,
          locksmithUri,
        })
        expect(unlocked).toBe(true)
        expect(spy).toHaveBeenCalledWith(
          readOnlyProvider,
          locksmithUri,
          Object.keys(paywallConfig.locks),
          userAccountAddress
        )
      })
    })
    describe('when the user does not have an optimistic pending transaction', () => {
      it('should return false', async () => {
        expect.assertions(2)
        const spy = jest
          .spyOn(optimisticUtil, 'optimisticUnlocking')
          .mockResolvedValue(false)

        const unlocked = await isUnlocked(userAccountAddress, paywallConfig, {
          readOnlyProvider,
          locksmithUri,
        })
        expect(unlocked).toBe(false)
        expect(spy).toHaveBeenCalledWith(
          readOnlyProvider,
          locksmithUri,
          Object.keys(paywallConfig.locks),
          userAccountAddress
        )
      })
    })
  })
})
