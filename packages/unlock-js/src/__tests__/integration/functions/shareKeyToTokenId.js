let walletService, web3Service, lockAddress, accounts, chainId

export default ({ publicLockVersion }) =>
  () => {
    if (['v10'].indexOf(publicLockVersion) !== -1) {
      beforeAll(() => {
        ;({ walletService, web3Service, lockAddress, accounts, chainId } =
          global.suiteData)
      })
      it('should allow a member to share their key with another one', async () => {
        expect.assertions(3)
        const grantee = accounts[8]
        const tokenId = await walletService.purchaseKey({
          lockAddress,
        })

        // Let's now get the duration for that key!
        const { expiration } = await web3Service.getKeyByLockForOwner(
          lockAddress,
          grantee,
          chainId
        )
        const now = Math.floor(new Date().getTime() / 1000)
        expect(expiration).toBeGreaterThan(now)

        // Let's now share the key
        const recipient = '0x6524dBB97462aC3919866b8fbB22BF181D1D4113'
        const newTokenId = await walletService.shareKey({
          lockAddress,
          tokenId,
          recipient,
          duration: expiration - now, // share all of the time!
        })

        const newExpiration = await web3Service.getKeyExpirationByLockForOwner(
          lockAddress,
          recipient,
          chainId
        )
        expect(newExpiration).toBeGreaterThanOrEqual(expiration)

        expect(
          await web3Service.ownerOf(lockAddress, newTokenId, chainId)
        ).toEqual(recipient)
      })
    }
  }
