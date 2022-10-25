import {
  versionEqualOrAbove,
  versionEqualOrBelow,
} from '../../helpers/integration'

let walletService, web3Service, lockAddress, accounts, chainId

export default ({ publicLockVersion }) =>
  () => {
    if (
      versionEqualOrAbove(publicLockVersion, 'v5') &&
      versionEqualOrBelow(publicLockVersion, 'v9')
    ) {
      beforeAll(() => {
        ;({ walletService, web3Service, lockAddress, accounts, chainId } =
          global.suiteData)
      })
      it('should allow a member to share their key with another one', async () => {
        expect.assertions(4)
        const tokenId = await walletService.purchaseKey({
          lockAddress,
        })

        // Let's now get the duration for that key!
        const { expiration } = await web3Service.getKeyByLockForOwner(
          lockAddress,
          accounts[0],
          chainId
        )
        const now = Math.floor(new Date().getTime() / 1000)
        expect(expiration).toBeGreaterThan(now)

        const recipient = '0x6524dbb97462ac3919866b8fbb22bf181d1d4113'
        const recipientDurationBefore =
          await web3Service.getKeyExpirationByLockForOwner(
            lockAddress,
            recipient,
            chainId
          )

        expect(recipientDurationBefore).toBe(0)

        // Let's now share the key
        await walletService.shareKey({
          lockAddress,
          tokenId,
          recipient,
          duration: expiration - now, // share all of the time!
        })

        const newExpiration = await web3Service.getKeyExpirationByLockForOwner(
          lockAddress,
          accounts[0],
          chainId
        )

        expect(newExpiration).toBeLessThan(expiration)

        expect(
          await web3Service.getKeyExpirationByLockForOwner(
            lockAddress,
            recipient,
            chainId
          )
        ).toBeGreaterThan(recipientDurationBefore)
      })
    }
  }
