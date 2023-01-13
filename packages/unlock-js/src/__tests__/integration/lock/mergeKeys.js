import { versionEqualOrAbove, getSigners } from '../../helpers'

let walletService, web3Service, lockAddress, lock, chainId, accounts

export default ({ publicLockVersion }) =>
  () => {
    if (versionEqualOrAbove(publicLockVersion, 'v10')) {
      let tokenIds
      let keys
      let keyOwners
      let transactionHash

      beforeAll(async () => {
        ;({ walletService, web3Service, lockAddress, lock, chainId, accounts } =
          global.suiteData)
        keyOwners = [accounts[5], accounts[6]]

        tokenIds = await walletService.purchaseKeys({
          lockAddress,
          owners: keyOwners,
          keyPrices: [lock.keyPrice, lock.keyPrice],
        })

        keys = await Promise.all(
          keyOwners.map(async (owner) =>
            web3Service.getKeyByLockForOwner(lockAddress, owner, chainId)
          )
        )

        // merge entire key
        const signers = await getSigners()
        await walletService.connect(signers[5].provider, signers[5])
        await walletService.mergeKeys(
          {
            lockAddress,
            tokenIdFrom: tokenIds[0],
            tokenIdTo: tokenIds[1],
          },
          {} /** transactionOptions */,

          (error, hash) => {
            if (error) {
              throw error
            }
            transactionHash = hash
          }
        )
        // connect back default signer
        await walletService.connect(signers[0].provider, signers[0])
      })

      it('should have yielded a transaction hash', () => {
        expect.assertions(1)
        expect(transactionHash).toMatch(/^0x[0-9a-fA-F]{64}$/)
      })

      it('should not have transfer the keys', async () => {
        expect.assertions(2)
        expect(
          await web3Service.ownerOf(keys[0].lock, tokenIds[0], chainId)
        ).toEqual(keyOwners[0])

        expect(
          await web3Service.ownerOf(keys[1].lock, tokenIds[1], chainId)
        ).toEqual(keyOwners[1])
      })

      it('should have validated the second key', async () => {
        expect.assertions(1)
        expect(
          await web3Service.isValidKey(keys[1].lock, tokenIds[1], chainId)
        ).toEqual(true)
      })

      it('should have add time to the second key', async () => {
        expect.assertions(1)
        const blockNumber = await walletService.provider.getBlockNumber()
        const latestBlock = await walletService.provider.getBlock(blockNumber)

        const keysAfter = await Promise.all(
          keyOwners.map(async (owner) =>
            web3Service.getKeyByLockForOwner(lockAddress, owner, chainId)
          )
        )

        expect(
          Math.floor(keysAfter[1].expiration) -
            Math.floor(latestBlock.timestamp) -
            lock.expirationDuration * 2
        ).toBeLessThan(60)
      })
    }
  }
