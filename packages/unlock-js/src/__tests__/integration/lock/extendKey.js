let walletService, web3Service, lockAddress, accounts, chainId

export default ({ publicLockVersion }) =>
  () => {
    if (['v10'].indexOf(publicLockVersion) !== -1) {
      let keyOwner
      let tokenId
      let transactionHash
      let key

      beforeAll(async () => {
        ;({ walletService, web3Service, lockAddress, accounts, chainId } =
          global.suiteData)

        keyOwner = accounts[5]

        tokenId = await walletService.purchaseKey({
          lockAddress,
          owners: keyOwner,
        })

        // expire key
        await walletService.expireAndRefundFor({
          lockAddress,
          keyOwner, // for lock < v10
          tokenId, // for lock v10+
        })

        // then extend existing expired key
        await walletService.extendKey(
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
          keyOwner,
          chainId
        )
      })

      it('should have yielded a transaction hash', () => {
        expect.assertions(1)
        expect(transactionHash).toMatch(/^0x[0-9a-fA-F]{64}$/)
      })

      it('should have renewed the key', async () => {
        expect.assertions(2)
        expect(
          await web3Service.isValidKey(lockAddress, tokenId, chainId)
        ).toBe(true)
        const now = Math.floor(new Date().getTime() / 1000)
        expect(key.expiration).toBeGreaterThan(now)
      })
    }
  }
