let walletService, web3Service, lockAddress, lock, chainId
export default ({ publicLockVersion }) =>
  () => {
    // Test only on lock v9 and above.
    if (['v9'].indexOf(publicLockVersion) !== -1) {
      let expirationDuration

      beforeAll(async () => {
        ;({ walletService, web3Service, lockAddress, lock, chainId } =
          global.suiteData)

        expirationDuration = lock.expirationDuration
        await walletService.setExpirationDuration(
          {
            lockAddress,
            expirationDuration: parseFloat(200).toString(),
          },
          (error) => {
            if (error) {
              throw error
            }
          }
        )
        lock = await web3Service.getLock(lockAddress, chainId)
      })

      it('Check if setMaxNumberOfKeys updated the maxNumberOfKeys', () => {
        expect.assertions(2)
        expect(expirationDuration).not.toBe(lock.expirationDuration)
        expect(lock.expirationDuration).toBe(200)
      })
    }
  }
