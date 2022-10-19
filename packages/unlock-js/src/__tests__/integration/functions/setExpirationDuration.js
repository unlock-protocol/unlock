let walletService, web3Service, lockAddress, lock, chainId
export default () => () => {
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
