let walletService, web3Service, chainId, lock, lockAddress

export default () => () => {
  const newName = 'new lock name'

  let oldName
  let changedName
  let transactionHash
  beforeAll(async () => {
    ;({ walletService, web3Service, chainId, lock, lockAddress } =
      global.suiteData)
    oldName = lock.name
    changedName = await walletService.updateLockName(
      {
        lockAddress,
        name: newName,
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

  it('should have changed the name', async () => {
    expect.assertions(2)
    expect(changedName).toEqual(newName)
    const lockContract = await walletService.getLockContract(lockAddress)
    expect(await lockContract.name()).toEqual(newName)
  })
}
