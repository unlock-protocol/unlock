import { versionEqualOrAbove } from '../../helpers/integration'
let accounts, web3Service, chainId, walletService, lock, lockAddress

export default ({ publicLockVersion }) =>
  () => {
    let tokenIds
    let keys
    let keyOwners
    let keyPurchaser
    let lockBalanceBefore
    let userBalanceBefore
    const transactionHashes = []

    beforeAll(async () => {
      ;({ accounts, web3Service, chainId, walletService, lock, lockAddress } =
        global.suiteData)
      keyPurchaser = accounts[0] // This is the default in walletService
      keyOwners = [accounts[10], accounts[11]]

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
      if (parseFloat(userBalanceBefore) < parseFloat(lock.keyPrice) * 2) {
        throw new Error(
          `Key purchaser ${keyPurchaser} does not have enough funds to perform key purchase on ${lockAddress}. Aborting tests.`
        )
      }

      tokenIds = await walletService.purchaseKeys(
        {
          lockAddress,
          owners: keyOwners,
          keyPrices: [lock.keyPrice, lock.keyPrice],
        },
        {} /** transactionOptions */,

        (error, hash) => {
          if (error) {
            throw error
          }
          transactionHashes.push(hash)
        }
      )

      keys = await Promise.all(
        keyOwners.map(async (owner) =>
          web3Service.getKeyByLockForOwner(lockAddress, owner, chainId)
        )
      )
    })

    it('should have yielded two transactions hash', () => {
      expect.assertions(3)
      if (versionEqualOrAbove(publicLockVersion, 'v10')) {
        expect(transactionHashes.length).toBe(1)
        expect(transactionHashes[0]).toMatch(/^0x[0-9a-fA-F]{64}$/)
        expect(transactionHashes[1]).toBeUndefined()
      } else {
        expect(transactionHashes.length).toBe(2)
        expect(transactionHashes[0]).toMatch(/^0x[0-9a-fA-F]{64}$/)
        expect(transactionHashes[1]).toMatch(/^0x[0-9a-fA-F]{64}$/)
      }
    })

    it('should yield the tokenId', () => {
      expect.assertions(5)
      expect(tokenIds).not.toBe(null)
      expect(typeof tokenIds).toBe('object')
      expect(tokenIds.length).toBe(2)
      expect(tokenIds[0]).not.toBe(null)
      expect(tokenIds[1]).not.toBe(null)
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

      // workaround for js float madness
      const approx = (n) => Math.round(n * 1000)
      expect(approx(parseFloat(newBalance))).toBeGreaterThanOrEqual(
        approx(parseFloat(lockBalanceBefore)) +
          approx(parseFloat(lock.keyPrice * 2))
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
          parseFloat(userBalanceBefore) - parseFloat(lock.keyPrice * 2)
        )
      } else {
        // For ERC20 the balance should be exact
        expect(parseFloat(newBalance)).toBe(
          parseFloat(userBalanceBefore) - parseFloat(lock.keyPrice * 2)
        )
      }
    })

    it('should have assigned the key to the right user', async () => {
      expect.assertions(4)
      expect(keys[0].owner).toEqual(keyOwners[0])
      const owner = await web3Service.ownerOf(
        keys[0].lock,
        tokenIds[0],
        chainId
      )
      expect(owner).toEqual(keyOwners[0])

      // 2nd key
      expect(keys[1].owner).toEqual(keyOwners[1])
      const owner2 = await web3Service.ownerOf(
        keys[1].lock,
        tokenIds[1],
        chainId
      )
      expect(owner2).toEqual(keyOwners[1])
    })

    it('should have assigned the key to the right lock', async () => {
      expect.assertions(2)
      expect(keys[0].lock).toEqual(lockAddress)
      expect(keys[1].lock).toEqual(lockAddress)
    })

    it('should have set the right duration on the key', async () => {
      expect.assertions(2)
      const blockNumber = await walletService.provider.getBlockNumber()
      const latestBlock = await walletService.provider.getBlock(blockNumber)
      expect(
        Math.floor(keys[0].expiration) -
          Math.floor(lock.expirationDuration + latestBlock.timestamp)
      ).toBeLessThan(60)
      expect(
        Math.floor(keys[1].expiration) -
          Math.floor(lock.expirationDuration + latestBlock.timestamp)
      ).toBeLessThan(60)
    })
  }
