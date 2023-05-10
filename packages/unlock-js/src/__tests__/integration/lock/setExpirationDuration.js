import { describe, it, expect, beforeAll } from 'vitest'
import { versionEqualOrAbove } from '../../helpers/integration'
let walletService, web3Service, lockAddress, lock, chainId

export default ({ publicLockVersion }) => {
  // Test only on lock v9 and above.
  if (versionEqualOrAbove(publicLockVersion, 'v9')) {
    describe('setExpirationDuration', () => {
      let expirationDuration

      beforeAll(async () => {
        ;({ walletService, web3Service, lockAddress, lock, chainId } =
          global.suiteData)

        expirationDuration = lock.expirationDuration
        await walletService.setExpirationDuration(
          {
            lockAddress,
            expirationDuration: parseFloat(200).toString(),
          },
          (error) => {
            if (error) {
              throw error
            }
          }
        )
        lock = await web3Service.getLock(lockAddress, chainId)
      })

      it('Check if setMaxNumberOfKeys updated the maxNumberOfKeys', () => {
        expect.assertions(2)
        expect(expirationDuration).not.toBe(lock.expirationDuration)
        expect(lock.expirationDuration).toBe(200)
      })
    })
  }
}
