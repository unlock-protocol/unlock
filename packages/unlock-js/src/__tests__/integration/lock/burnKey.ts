import { describe, it, expect, beforeAll } from 'vitest'
import { versionEqualOrAbove } from '../../helpers/integration'

let walletService, web3Service, lockAddress, accounts, chainId

export default ({ publicLockVersion }) => {
  if (versionEqualOrAbove(publicLockVersion, 'v10')) {
    describe('burnKey', () => {
      let keyOwner
      let tokenId
      let transactionHash

      beforeAll(async () => {
        ;({ walletService, web3Service, lockAddress, accounts, chainId } =
          global.suiteData)

        keyOwner = accounts[10]

        tokenId = await walletService.purchaseKey({
          lockAddress,
          owners: keyOwner,
        })

        expect(
          await web3Service.isValidKey(lockAddress, tokenId, chainId)
        ).toBe(true)

        // then extend existing expired key
        await walletService.burnKey(
          {
            lockAddress,
            tokenId,
          },
          {} /** transactionOptions */,

          (error, hash) => {
            if (error) {
              throw error
            }
            transactionHash = hash
          }
        )
        await web3Service.getKeyByTokenId(lockAddress, tokenId, chainId)
      })

      it('should have yielded a transaction hash', () => {
        expect.assertions(1)
        expect(transactionHash).toMatch(/^0x[0-9a-fA-F]{64}$/)
      })

      it('should have burned the key', async () => {
        expect.assertions(1)
        expect(
          await web3Service.isValidKey(lockAddress, tokenId, chainId)
        ).toBe(false)
      })
    })
  }
}
