let walletService, web3Service, lockAddress, lock, chainId
import { versionEqualOrAbove } from '../../helpers/integration'

export default ({ publicLockVersion }) =>
  () => {
    // Test only on lock v9 and above.
    if (versionEqualOrAbove(publicLockVersion, 'v9')) {
      console.log('haha', publicLockVersion)

      let oldMaxNumberOfKeys
      beforeAll(async () => {
        ;({ walletService, web3Service, lockAddress, lock, chainId } =
          global.suiteData)
        oldMaxNumberOfKeys = lock.maxNumberOfKeys
        await walletService.setMaxNumberOfKeys(
          {
            lockAddress,
            maxNumberOfKeys: parseFloat(200).toString(),
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
        expect(oldMaxNumberOfKeys).not.toBe(lock.maxNumberOfKeys)
        expect(lock.maxNumberOfKeys).toBe(200)
      })
    }
  }
