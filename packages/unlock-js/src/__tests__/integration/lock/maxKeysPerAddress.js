import { describe, it, expect, beforeAll } from 'vitest'
import { versionEqualOrAbove } from '../../helpers/integration'

let walletService, web3Service, lockAddress, lock, chainId

export default ({ publicLockVersion }) => {
  if (versionEqualOrAbove(publicLockVersion, 'v10')) {
    describe('maxKeysPerAddress', () => {
      beforeAll(() => {
        ;({ walletService, web3Service, lockAddress, lock, chainId } =
          global.suiteData)
      })
      it('should set number of keys per address correctly', async () => {
        expect.assertions(2)
        lock = await web3Service.getLock(lockAddress, chainId)
        expect(lock.maxKeysPerAddress).toEqual(100)

        await walletService.setMaxKeysPerAddress({
          lockAddress,
          maxKeysPerAddress: 1000,
          chainId,
        })
        lock = await web3Service.getLock(lockAddress, chainId)
        expect(lock.maxKeysPerAddress).toEqual(1000)
      })
    })
  }
}
