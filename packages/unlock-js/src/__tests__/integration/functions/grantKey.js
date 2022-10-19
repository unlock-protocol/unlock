let accounts,
  web3Service,
  chainId,
  walletService,
  lock,
  lockAddress,
  publicLockVersion

export default () => {
  let tokenId
  let key
  let keyBefore
  let keyGrantee
  let transactionHash
  beforeAll(async () => {
    ;({
      accounts,
      web3Service,
      chainId,
      walletService,
      lock,
      lockAddress,
      publicLockVersion,
    } = global.suiteData)
    keyGrantee = accounts[7]
    keyBefore = await web3Service.getKeyByLockForOwner(
      lockAddress,
      keyGrantee,
      chainId
    )
    tokenId = await walletService.grantKey(
      {
        lockAddress,
        recipient: keyGrantee,
      },
      {} /** transactionOptions */,

      (error, hash) => {
        if (error) {
          throw error
        }
        transactionHash = hash
      }
    )
    key = await web3Service.getKeyByLockForOwner(
      lockAddress,
      keyGrantee,
      chainId
    )
  })

  it('should not have a valid key before the transaction', () => {
    expect.assertions(2)
    expect(keyBefore.owner).toEqual(keyGrantee)
    expect(keyBefore.expiration).toEqual(0)
  })

  it('should have yielded a transaction hash', () => {
    expect.assertions(1)
    expect(transactionHash).toMatch(/^0x[0-9a-fA-F]{64}$/)
  })

  it('should yield the tokenId', () => {
    expect.assertions(1)
    expect(tokenId).not.toBe(null) // We don't know very much beyond the fact that it is not null
  })

  it('should have assigned the key to the right user', async () => {
    expect.assertions(1)
    expect(key.owner).toEqual(keyGrantee)
  })

  it('should have assigned the key to the right lock', async () => {
    expect.assertions(1)
    expect(key.lock).toEqual(lockAddress)
  })

  it('should have set the right duration on the key', async () => {
    expect.assertions(1)
    const blockNumber = await walletService.provider.getBlockNumber()
    const latestBlock = await walletService.provider.getBlock(blockNumber)
    expect(
      Math.floor(key.expiration) -
        Math.floor(lock.expirationDuration + latestBlock.timestamp)
    ).toBeLessThan(60)
  })

  if (['v4', 'v6'].indexOf(publicLockVersion) == -1) {
    it('should have set the right keyManager', async () => {
      expect.assertions(1)
      const keyManager = await web3Service.keyManagerOf(
        lockAddress,
        key.tokenId,
        chainId
      )
      expect(keyManager).toBe(accounts[0])
    })
  }
}
