let web3Service, walletService, accounts, lock, lockAddress, chainId

export default () => () => {
  let tokenId
  let key
  let keyOwner
  let keyPurchaser
  let lockBalanceBefore
  let userBalanceBefore
  let transactionHash
  let totalKeysBefore

  beforeAll(async () => {
    ;({ web3Service, walletService, accounts, lock, lockAddress, chainId } =
      global.suiteData)

    keyPurchaser = accounts[0] // This is the default in walletService
    keyOwner = accounts[5]

    totalKeysBefore = await web3Service.totalKeys(
      lockAddress,
      keyOwner,
      chainId
    )
    if (lock.currencyContractAddress === null) {
      // Get the ether balance of the lock before the purchase
      lockBalanceBefore = await web3Service.getAddressBalance(
        lockAddress,
        chainId
      )
      // Get the ether balance of the user before the purchase
      userBalanceBefore = await web3Service.getAddressBalance(
        keyPurchaser,
        chainId
      )
    } else {
      // Get the erc20 balance of the lock before the purchase
      lockBalanceBefore = await web3Service.getTokenBalance(
        lock.currencyContractAddress,
        lockAddress,
        chainId
      )
      // Get the erc20 balance of the user before the purchase
      userBalanceBefore = await web3Service.getTokenBalance(
        lock.currencyContractAddress,
        keyPurchaser,
        chainId
      )
    }

    // No need to go further if the purchaser does not have enough to make key purchases
    // Make sure the account[0] (used by default by walletService) has enough Ether or ERC20
    if (parseFloat(userBalanceBefore) < parseFloat(lock.keyPrice)) {
      throw new Error(
        `Key purchaser ${keyPurchaser} does not have enough funds to perform key purchase on ${lockAddress}. Aborting tests.`
      )
    }

    tokenId = await walletService.purchaseKey(
      {
        lockAddress,
        owner: keyOwner,
        keyPrice: lock.keyPrice,
      },
      {} /** transactionOptions */,
      (error, hash) => {
        if (error) {
          throw error
        }
        transactionHash = hash
      }
    )
    key = await web3Service.getKeyByLockForOwner(lockAddress, keyOwner, chainId)
  })

  it('should have yielded a transaction hash', () => {
    expect.assertions(1)
    expect(transactionHash).toMatch(/^0x[0-9a-fA-F]{64}$/)
  })

  it('should yield the tokenId', () => {
    expect.assertions(1)
    expect(tokenId).not.toBe(null) // We don't know very much beyond the fact that it is not null
  })

  it('should have increased the currency balance on the lock', async () => {
    expect.assertions(1)
    let newBalance
    if (lock.currencyContractAddress === null) {
      newBalance = await web3Service.getAddressBalance(lockAddress, chainId)
    } else {
      newBalance = await web3Service.getTokenBalance(
        lock.currencyContractAddress,
        lockAddress,
        chainId
      )
    }
    expect(parseFloat(newBalance)).toEqual(
      parseFloat(lockBalanceBefore) + parseFloat(lock.keyPrice)
    )
  })

  it('should have decreased the currency balance of the person making the purchase', async () => {
    expect.assertions(1)
    let newBalance
    if (lock.currencyContractAddress === null) {
      newBalance = await web3Service.getAddressBalance(keyPurchaser, chainId)
    } else {
      newBalance = await web3Service.getTokenBalance(
        lock.currencyContractAddress,
        keyPurchaser,
        chainId
      )
    }

    if (lock.currencyContractAddress === null) {
      // For Ether we need to account for gas
      expect(parseFloat(newBalance)).toBeLessThan(
        parseFloat(userBalanceBefore) - parseFloat(lock.keyPrice)
      )
    } else {
      // For ERC20 the balance should be exact
      expect(parseFloat(newBalance)).toBe(
        parseFloat(userBalanceBefore) - parseFloat(lock.keyPrice)
      )
    }
  })

  it('should have assigned the key to the right user', async () => {
    expect.assertions(2)
    expect(key.owner).toEqual(keyOwner)
    const owner = await web3Service.ownerOf(key.lock, tokenId, chainId)
    expect(owner).toEqual(keyOwner)
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

  it('should have increased the number of keys for owner', async () => {
    expect.assertions(2)

    const totalKeys = await web3Service.totalKeys(
      lockAddress,
      keyOwner,
      chainId
    )
    expect(totalKeys).toBe(1)
    expect(totalKeysBefore).toBe(0)
  })
}
