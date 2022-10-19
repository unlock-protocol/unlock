let walletService, web3Service, lockAddress, chainId

export default () => () => {
  let keyOwner = '0x2f883401de65129fd1c368fe3cb26d001c4dc583'
  let expiration
  let tokenId
  beforeAll(async () => {
    ;({ walletService, web3Service, lockAddress, chainId } = global.suiteData)

    // First let's get a user to buy a membership
    tokenId = await walletService.purchaseKey({
      lockAddress,
      owner: keyOwner,
    })
  })

  it('should have set an expiration for this member in the future', async () => {
    expect.assertions(1)
    const key = await web3Service.getKeyByLockForOwner(
      lockAddress,
      keyOwner,
      chainId
    )
    expiration = key.expiration

    expect(expiration).toBeGreaterThan(new Date().getTime() / 1000)
  })

  it('should expire the membership', async () => {
    expect.assertions(1)
    await walletService.expireAndRefundFor({
      lockAddress,
      keyOwner, // for lock < v10
      tokenId, // for lock v10+
    })
    const key = await web3Service.getKeyByLockForOwner(
      lockAddress,
      keyOwner,
      chainId
    )

    expect(expiration).toBeGreaterThan(key.expiration)
  })
}
