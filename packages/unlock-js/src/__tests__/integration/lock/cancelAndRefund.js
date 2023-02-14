let web3Service, chainId, walletService, lockAddress, accounts

export default () => () => {
  let key
  let keyOwner
  let tokenId

  beforeAll(async () => {
    ;({ web3Service, chainId, walletService, lockAddress, accounts } =
      global.suiteData)
    keyOwner = accounts[0]
    tokenId = await walletService.purchaseKey({
      lockAddress,
    })
    await new Promise((resolve) =>
      setTimeout(async () => {
        key = await web3Service.getKeyByLockForOwner(
          lockAddress,
          keyOwner,
          chainId
        )
        resolve()
      }, 5000)
    )
  })

  it('should have a key and allow the member to cancel it and get a refund', async () => {
    expect.assertions(2)
    expect(key.expiration > new Date().getTime() / 1000).toBe(true)
    await walletService.cancelAndRefund({
      lockAddress,
      tokenId, // pass explicitely the token id
    })
    const afterCancellation = await web3Service.getKeyByLockForOwner(
      lockAddress,
      keyOwner,
      chainId
    )
    expect(afterCancellation.expiration < key.expiration).toBe(true)
  })
}
