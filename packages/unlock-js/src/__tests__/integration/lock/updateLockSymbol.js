let walletService, web3Service, chainId, lock, lockAddress

export default () => () => {
  const newSymbol = 'NEW_KEY'

  let oldSymbol
  let changedSymbol
  let transactionHash
  beforeAll(async () => {
    ;({ walletService, web3Service, chainId, lock, lockAddress } =
      global.suiteData)
    oldSymbol = lock.symbol
    changedSymbol = await walletService.updateLockSymbol(
      {
        lockAddress,
        symbol: newSymbol,
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

  it('should have changed the symbol', async () => {
    expect.assertions(2)
    expect(changedSymbol).toEqual(newSymbol)
    const lockContract = await walletService.getLockContract(lockAddress)
    expect(await lockContract.symbol()).toEqual(newSymbol)
  })
}
