import { describe, it, expect, beforeAll } from 'vitest'
import { versionEqualOrAbove, setupLock } from '../../helpers/integration'
let walletService, web3Service, lockAddress, accounts, chainId, unlockVersion
import hre from 'hardhat'
import { UNLIMITED_KEYS_COUNT } from '../../../constants'

export default ({ publicLockVersion }) => {
  if (versionEqualOrAbove(publicLockVersion, 'v11')) {
    describe('lendKey', () => {
      let tokenId
      let transactionHash
      let keyOwner
      let newOwner

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
            expirationDuration: 60n * 60n * 24n * 30n,
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

        const newWallet = ethers.Wallet.createRandom()
        newOwner = newWallet.address

        // lend the key
        await walletService.lendKey({
          lockAddress,
          from: keyOwner,
          to: newOwner,
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

      it('should correctly lend a key to a new owner', async () => {
        expect.assertions(2)

        // check that the owner is changed but key manager is not
        const currentOwner = await web3Service.ownerOf(
          lockAddress,
          tokenId,
          chainId
        )
        expect(currentOwner).toBe(newOwner)
        const currentKeyManager = await web3Service.keyManagerOf(
          lockAddress,
          tokenId,
          chainId
        )
        expect(currentKeyManager.toLowerCase()).toEqual(accounts[0])
      })
    })
  }
}
