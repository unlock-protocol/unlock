let walletService, web3Service, chainId, lock, lockAddress

export default () => () => {
  const newTokenURI = 'http://some-custom-uri.com/'

  let oldTokenURI
  let changedTokenURI
  let transactionHash
  let lockContract

  beforeAll(async () => {
    ;({ walletService, web3Service, chainId, lock, lockAddress } =
      global.suiteData)

    lockContract = await walletService.getLockContract(lockAddress)
    oldTokenURI = await lockContract.tokenURI(0)
    changedTokenURI = await walletService.setBaseTokenURI(
      {
        lockAddress,
        baseTokenURI: newTokenURI,
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
    expect(changedTokenURI).toEqual(newTokenURI)
    expect(await lockContract.tokenURI(0)).toEqual(newTokenURI)
    expect(await lockContract.tokenURI(1)).toEqual(`${newTokenURI}1`)
    expect(await lockContract.baseTokenURI(123)).toEqual(`${newTokenURI}123`)
  })
}
