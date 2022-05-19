import { isUnlocked } from '../../utils/isUnlocked'
import * as optimisticUtil from '../../utils/optimisticUnlocking'
import * as timeStampUtil from '../../utils/hasValidKey'

const provider = 'https://rpc.endpoint'
const locksmithUri = 'https://locksmith.unlock-protocol.com'

const networkConfigs = {
  31337: {
    provider,
    locksmithUri,
  },
}

const userAccountAddress = '0xUser'
const paywallConfig = {
  network: 31337,
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
      expect.assertions(6)
      const spy = jest
        .spyOn(timeStampUtil, 'hasValidKey')
        .mockResolvedValue(true)

      const unlocked = await isUnlocked(
        userAccountAddress,
        paywallConfig,
        networkConfigs
      )
      expect(unlocked.length).toBe(2)
      expect(unlocked[0]).toBe('0x1234567890123456789012345678901234567890')
      expect(unlocked[1]).toBe('0x7C5af12cFcbAAd7893351B41a6DF251d67fD310D')

      expect(spy).toHaveBeenCalledTimes(2)
      expect(spy).toHaveBeenNthCalledWith(
        1,
        provider,
        Object.keys(paywallConfig.locks)[0],
        userAccountAddress
      )
      expect(spy).toHaveBeenNthCalledWith(
        2,
        provider,
        Object.keys(paywallConfig.locks)[1],
        userAccountAddress
      )
    })
  })

  describe('when the user does not have a valid key to any of the locks', () => {
    beforeEach(() => {
      jest.spyOn(timeStampUtil, 'hasValidKey').mockResolvedValue(false)
    })

    describe('when the config is pessimistic', () => {
      it('should return an empty even if the user has a pending transaction', async () => {
        expect.assertions(2)
        const spy = jest
          .spyOn(optimisticUtil, 'optimisticUnlocking')
          .mockResolvedValue(true)

        const pesimisticConfig = {
          ...paywallConfig,
          pessimistic: true,
        }

        const unlocked = await isUnlocked(
          userAccountAddress,
          pesimisticConfig,
          networkConfigs
        )
        expect(unlocked.length).toBe(0)
        expect(spy).not.toHaveBeenCalled()
      })
    })

    describe('when the user has a pending transaction for which we should be optimistic', () => {
      it('should return true', async () => {
        expect.assertions(5)
        const spy = jest
          .spyOn(optimisticUtil, 'optimisticUnlocking')
          .mockResolvedValue(true)

        const unlocked = await isUnlocked(
          userAccountAddress,
          paywallConfig,
          networkConfigs
        )
        expect(unlocked.length).toBe(2)
        expect(unlocked[0]).toBe('0x1234567890123456789012345678901234567890')
        expect(unlocked[1]).toBe('0x7C5af12cFcbAAd7893351B41a6DF251d67fD310D')

        expect(spy).toHaveBeenCalledWith(
          provider,
          locksmithUri,
          ['0x1234567890123456789012345678901234567890'],
          userAccountAddress
        )
        expect(spy).toHaveBeenCalledWith(
          provider,
          locksmithUri,
          ['0x7C5af12cFcbAAd7893351B41a6DF251d67fD310D'],
          userAccountAddress
        )
      })
    })
    describe('when the user does not have an optimistic pending transaction', () => {
      it('should return an empty array', async () => {
        expect.assertions(3)
        const spy = jest
          .spyOn(optimisticUtil, 'optimisticUnlocking')
          .mockResolvedValue(false)

        const unlocked = await isUnlocked(
          userAccountAddress,
          paywallConfig,
          networkConfigs
        )
        expect(unlocked.length).toBe(0)
        expect(spy).toHaveBeenCalledWith(
          provider,
          locksmithUri,
          ['0x1234567890123456789012345678901234567890'],
          userAccountAddress
        )
        expect(spy).toHaveBeenCalledWith(
          provider,
          locksmithUri,
          ['0x7C5af12cFcbAAd7893351B41a6DF251d67fD310D'],
          userAccountAddress
        )
      })
    })
  })
})
