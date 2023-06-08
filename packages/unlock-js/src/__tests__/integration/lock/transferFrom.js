import { describe, it, expect, beforeAll } from 'vitest'
import { versionEqualOrAbove, setupLock } from '../../helpers/integration'
let walletService, web3Service, lockAddress, accounts, chainId, unlockVersion
import hre from 'hardhat'
import { UNLIMITED_KEYS_COUNT } from '../../../constants'

export default ({ publicLockVersion }) => {
  if (versionEqualOrAbove(publicLockVersion, 'v9')) {
    describe('transferFrom', () => {
      let tokenId
      let transactionHash
      let keyOwner
      let newOwner
      let prevOwner

      const { ethers } = hre

      beforeAll(async () => {
        ;({ walletService, web3Service, accounts, chainId, unlockVersion } =
          global.suiteData)

        // create new lock
        const newLock = await setupLock({
          walletService,
          web3Service,
          publicLockVersion,
          unlockVersion,
          lockParams: {
            name: 'Lock for transfer',
            expirationDuration: 60 * 60 * 24 * 30,
            maxNumberOfKeys: UNLIMITED_KEYS_COUNT,
            isERC20: false,
            keyPrice: '0.1',
          },
        })

        lockAddress = newLock.lockAddress
        const keyPrice = newLock.lock.keyPrice

        // purchase a new key
        const wallet = ethers.Wallet.createRandom()
        keyOwner = wallet.address
        tokenId = await walletService.purchaseKey(
          {
            lockAddress,
            keyPrice,
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

        // store prev owner
        prevOwner = await web3Service.ownerOf(lockAddress, tokenId, chainId)

        const newWallet = ethers.Wallet.createRandom()
        newOwner = newWallet.address

        await walletService.transferFrom({
          keyOwner,
          to: newOwner,
          lockAddress,
          tokenId,
        })
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

        // check that the prev owner is correct
        expect(prevOwner).toBe(keyOwner)

        // check that the owner is changed
        const currentOwner = await web3Service.ownerOf(
          lockAddress,
          tokenId,
          chainId
        )
        expect(currentOwner).toBe(newOwner)
      })
    })
  }
}
