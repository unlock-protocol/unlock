let walletService, web3Service, chainId, lock, lockAddress

export default () => {
  let oldKeyPrice
  let newPrice
  let transactionHash
  beforeAll(async () => {
    ;({ walletService, web3Service, chainId, lock, lockAddress } =
      global.suiteData)
    oldKeyPrice = lock.keyPrice
    newPrice = await walletService.updateKeyPrice(
      {
        lockAddress,
        keyPrice: (parseFloat(oldKeyPrice) * 2).toString(),
      },
      {} /** transactionOptions */,
      (error, hash) => {
        if (error) {
          throw error
        }
        transactionHash = hash
      }
    )
    lock = await web3Service.getLock(lockAddress, chainId)
  })

  it('should have yielded a transaction hash', () => {
    expect.assertions(1)
    expect(transactionHash).toMatch(/^0x[0-9a-fA-F]{64}$/)
  })

  it('should have changed the keyPrice', () => {
    expect.assertions(2)
    expect(newPrice).toEqual((parseFloat(oldKeyPrice) * 2).toString())
    expect(lock.keyPrice).toEqual(newPrice)
  })
}
