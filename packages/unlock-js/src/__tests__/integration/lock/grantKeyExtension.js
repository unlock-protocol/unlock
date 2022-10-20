let accounts, web3Service, chainId, walletService, lock, lockAddress

export default ({ publicLockVersion }) =>
  () => {
    if (['v11'].indexOf(publicLockVersion) > -1) {
      describe('grantKeyExtension', () => {
        let tokenId
        let key
        let keyBefore
        let keyGrantee
        let transactionHash
        beforeAll(async () => {
          ;({
            accounts,
            web3Service,
            chainId,
            walletService,
            lock,
            lockAddress,
          } = global.suiteData)
          keyGrantee = accounts[15]
          const { id } = await walletService.grantKey({
            lockAddress,
            recipient: keyGrantee,
          })
          tokenId = id

          keyBefore = await web3Service.getKeyByLockForOwner(
            lockAddress,
            keyGrantee,
            chainId
          )
          // extend
          await walletService.grantKeyExtension(
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
          key = await web3Service.getKeyByLockForOwner(
            lockAddress,
            keyGrantee,
            chainId
          )
        })

        it('should have a valid key before the transaction', async () => {
          expect.assertions(2)
          const blockNumber = await walletService.provider.getBlockNumber()
          const { timestamp } = await walletService.provider.getBlock(
            blockNumber
          )
          expect(keyBefore.owner).toEqual(keyGrantee)
          expect(keyBefore.expiration >= timestamp).toBeTruthy()
        })

        it('should have yielded a transaction hash', () => {
          expect.assertions(1)
          expect(transactionHash).toMatch(/^0x[0-9a-fA-F]{64}$/)
        })

        it('should have kept the key assigned to the right user', async () => {
          expect.assertions(1)
          expect(key.owner).toEqual(keyGrantee)
        })

        it('should have kept the key in the right lock', async () => {
          expect.assertions(1)
          expect(key.lock).toEqual(lockAddress)
        })

        it('should have extend the key by the correct duration', async () => {
          expect.assertions(1)
          const blockNumber = await walletService.provider.getBlockNumber()
          const { timestamp } = await walletService.provider.getBlock(
            blockNumber
          )
          expect(
            Math.floor(key.expiration) -
              Math.floor(lock.expirationDuration * 2 + timestamp)
          ).toBeLessThan(60)
        })
      })
    }
  }
