let accounts, web3Service, chainId, walletService, lock, lockAddress

export default ({ publicLockVersion }) =>
  () => {
    let tokenIds
    let keys
    let keysBefore
    let keyGrantees
    let transactionHash
    let totalKeysBefore

    beforeAll(async () => {
      ;({ accounts, web3Service, chainId, walletService, lock, lockAddress } =
        global.suiteData)
      keyGrantees = [accounts[8], accounts[9]]

      totalKeysBefore = await Promise.all(
        keyGrantees.map((grantee) =>
          web3Service.totalKeys(lockAddress, grantee, chainId)
        )
      )

      // enable grant of multiple keys for same address for locks v10+
      if (['v10', 'v11'].indexOf(publicLockVersion) !== -1) {
        await walletService.setMaxKeysPerAddress({
          lockAddress,
          maxKeysPerAddress: 100,
          chainId,
        })
      }

      keysBefore = await Promise.all(
        keyGrantees.map((grantee) =>
          web3Service.getKeyByLockForOwner(lockAddress, grantee, chainId)
        )
      )

      tokenIds = await walletService.grantKeys(
        {
          lockAddress,
          recipients: keyGrantees,
        },
        {} /** transactionOptions */,

        (error, hash) => {
          if (error) {
            throw error
          }
          transactionHash = hash
        }
      )

      keys = await Promise.all(
        tokenIds.map(async (tokenId, index) => {
          return await web3Service.getKeyByLockForOwner(
            lockAddress,
            keyGrantees[index],
            chainId
          )
        })
      )
    })

    it('should not have valid keys before the transaction', () => {
      expect.assertions(4)

      expect(keysBefore[0].owner).toEqual(keyGrantees[0])
      expect(keysBefore[1].owner).toEqual(keyGrantees[1])
      expect(keysBefore[0].expiration).toEqual(0)
      expect(keysBefore[1].expiration).toEqual(0)
    })

    it('should have yielded a transaction hash', () => {
      expect.assertions(1)
      expect(transactionHash).toMatch(/^0x[0-9a-fA-F]{64}$/)
    })

    it('should yield the tokenIds', () => {
      expect.assertions(1)
      expect(tokenIds).not.toBe(null) // We don't know very much beyond the fact that it is not null
    })

    it('should have assigned the key to the right user', async () => {
      expect.assertions(2)
      expect(keys[0].owner).toEqual(keyGrantees[0])
      expect(keys[1].owner).toEqual(keyGrantees[1])
    })

    it('should have assigned the key to the right lock', async () => {
      expect.assertions(1)
      expect(keys[0].lock).toEqual(lockAddress)
    })

    it('should have set the right duration on the keys', async () => {
      expect.assertions(1)
      const blockNumber = await walletService.provider.getBlockNumber()
      const latestBlock = await walletService.provider.getBlock(blockNumber)
      expect(
        Math.floor(keys[0].expiration) -
          Math.floor(lock.expirationDuration + latestBlock.timestamp)
      ).toBeLessThan(60)
    })

    if (['v4', 'v6'].indexOf(publicLockVersion) == -1) {
      it('should have set the right keyManager', async () => {
        expect.assertions(1)
        const keyManager = await web3Service.keyManagerOf(
          lockAddress,
          keys[0].tokenId,
          chainId
        )
        expect(keyManager).toBe(accounts[0])
      })
    }

    it('should have increased the total of keys for owners', async () => {
      expect.assertions(4)
      const totalKeys = await Promise.all(
        keyGrantees.map((owner) =>
          web3Service.totalKeys(lockAddress, owner, chainId)
        )
      )
      expect(totalKeys[0]).toBe(1)
      expect(totalKeys[1]).toBe(1)
      expect(totalKeysBefore[0]).toBe(0)
      expect(totalKeysBefore[1]).toBe(0)
    })
  }
