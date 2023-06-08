import { describe, it, expect, beforeAll } from 'vitest'
import { versionEqualOrAbove } from '../../helpers/integration'
let walletService, web3Service, lockAddress, accounts, chainId, lock
import hre from 'hardhat'

export default ({ publicLockVersion }) => {
  if (versionEqualOrAbove(publicLockVersion, 'v6')) {
    describe('transferFrom', () => {
      let tokenId
      let transactionHash
      let keyOwner

      const { ethers } = hre

      beforeAll(async () => {
        ;({ walletService, web3Service, lockAddress, accounts, chainId, lock } =
          global.suiteData)

        const wallet = ethers.Wallet.createRandom()
        keyOwner = wallet.address

        // purchase a new key
        tokenId = await walletService.purchaseKey(
          {
            lockAddress,
            keyPrice: lock.keyPrice,
            owner: keyOwner,
            keyManager: accounts[0],
          },
          {} /** transactionOptions */,
          (error, hash) => {
            if (error) {
              throw error
            }
            transactionHash = hash
          }
        )
      })

      it('should have yielded a transaction hash', () => {
        expect.assertions(1)
        expect(transactionHash).toMatch(/^0x[0-9a-fA-F]{64}$/)
      })

      it('should yield the tokenId', () => {
        expect.assertions(1)
        expect(tokenId).not.toBe(null) // We don't know very much beyond the fact that it is not null
      })

      it('should correctly transfer ownership to a new owner', async () => {
        expect.assertions(2)

        // check that the owner is the default one
        const prevOwner = await web3Service.ownerOf(
          lockAddress,
          tokenId,
          chainId
        )
        expect(prevOwner).toEqual(keyOwner)

        const wallet = ethers.Wallet.createRandom()
        const newOwner = wallet.address

        // transfer key to a new owner
        await walletService.transferFrom({
          keyOwner,
          to: newOwner,
          lockAddress,
          tokenId,
        })

        const currentOwner = await web3Service.ownerOf(
          lockAddress,
          tokenId,
          chainId
        )

        // check that the owner is changed
        expect(currentOwner).toEqual(newOwner)
      })
    })
  }
}
