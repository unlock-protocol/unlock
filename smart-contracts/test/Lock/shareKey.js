const { assert } = require('chai')
const { ethers } = require('hardhat')

const {
  reverts,
  deployLock,
  ADDRESS_ZERO,
  purchaseKeys,
} = require('../helpers')

const ONE_DAY = ethers.BigNumber.from(60 * 60 * 24)
const TOO_MUCH_TIME = 60 * 60 * 24 * 30 * 2 // 60 days

contract('Lock / shareKey', (accounts) => {
  let lock
  let tokenIds

  const keyOwners = [accounts[1], accounts[2], accounts[3]]
  const accountWithNoKey2 = accounts[5]
  const accountWithNoKey3 = accounts[6]
  const approvedAddress = accounts[7]

  beforeEach(async () => {
    lock = await deployLock()
    await lock.setMaxKeysPerAddress(10)
    ;({ tokenIds } = await purchaseKeys(lock, keyOwners.length))
  })

  describe('failing to share a key', () => {
    describe('not meeting pre-requisites', () => {
      it('sender is not approved', async () => {
        await reverts(
          lock.shareKey(accounts[7], 11, 1000, {
            from: accounts[4],
          }),
          'ONLY_KEY_MANAGER_OR_APPROVED'
        )
      })

      it('called by other than keyOwner or approved ', async () => {
        await reverts(
          lock.shareKey(accounts[3], tokenIds[0], 1000, {
            from: accounts[6],
          }),
          'ONLY_KEY_MANAGER_OR_APPROVED'
        )
      })

      it('should abort if the recipient is 0x', async () => {
        await reverts(
          lock.shareKey(ADDRESS_ZERO, tokenIds[0], 1000, {
            from: keyOwners[0],
          }),
          'INVALID_ADDRESS'
        )
      })

      it('should revert if keys are sold out', async () => {
        await purchaseKeys(lock, 7)
        await reverts(
          lock.shareKey(keyOwners[0], tokenIds[0], 1000, {
            from: keyOwners[0],
          }),
          'LOCK_SOLD_OUT'
        )
      })
    })

    it('should fail if trying to share a key with a contract which does not implement onERC721Received', async () => {
      // A contract which does NOT implement onERC721Received:
      const NonCompliantContract = artifacts.require('TestEventHooks')
      const { address } = await NonCompliantContract.new()

      assert.equal(await lock.isValidKey(tokenIds[2]), true)
      assert.equal(await lock.ownerOf(tokenIds[2]), keyOwners[2])
      await reverts(
        lock.shareKey(address, tokenIds[2], 1000, {
          from: keyOwners[2],
        })
      )
      // make sure the key was not shared
      assert.notEqual(await lock.ownerOf(tokenIds[2]), address)
    })

    describe('fallback behaviors', () => {
      let remaining
      let tx

      beforeEach(async () => {
        assert.equal(await lock.isValidKey(tokenIds[1]), true)
        remaining = await lock.keyExpirationTimestampFor(tokenIds[1])
        assert.equal(await lock.balanceOf(accounts[4]), 0)

        tx = await lock.shareKey(accounts[4], tokenIds[1], TOO_MUCH_TIME, {
          from: keyOwners[1],
        })
      })

      it('transfers all remaining time if amount to share >= remaining time', async () => {
        const { args } = tx.logs.find((v) => v.event === 'Transfer')
        assert.equal(await lock.isValidKey(args.tokenId), true)

        // new owner now has a fresh key
        assert.equal(await lock.balanceOf(accounts[4]), 1)
        assert.equal(await lock.getHasValidKey(accounts[4]), true)

        let newExpirationTimestamp = await lock.keyExpirationTimestampFor(
          args.tokenId
        )
        assert.equal(newExpirationTimestamp.toString(), remaining.toString())
      })

      it('should emit the expireKey Event', async () => {
        const evt = tx.logs.find(({ event }) => event === 'ExpireKey')
        assert.equal(evt.args.tokenId.toNumber(), tokenIds[1].toNumber())
      })

      it('The origin key is expired', async () => {
        assert.equal(await lock.isValidKey(tokenIds[1]), false)
        assert.equal(await lock.getHasValidKey(keyOwners[1]), false)
      })

      it('The original owner still owns their key', async () => {
        assert.equal(await lock.ownerOf(tokenIds[1]), keyOwners[1])
      })
    })
  })

  describe('approved account sharing a key', () => {
    beforeEach(async () => {
      // approve an address
      await lock.approve(approvedAddress, tokenIds[2], {
        from: keyOwners[2],
      })
    })

    it('should allow an approved address to share a key', async () => {
      // make sure recipient does not have a key
      assert.equal(await lock.getHasValidKey(accountWithNoKey3), false)
      const tx = await lock.shareKey(accountWithNoKey3, tokenIds[2], ONE_DAY, {
        from: approvedAddress,
      })
      // make sure recipient has a key
      const { args } = tx.logs.find((v) => v.event === 'Transfer')
      assert.equal(await lock.ownerOf(args.tokenId), accountWithNoKey3)
    })
  })

  describe('successful key sharing', () => {
    let fee
    let tx
    let timestampAfter
    let expirationBefore
    let newTokenId

    beforeEach(async () => {
      // Change the fee to 5%
      await lock.updateTransferFee(500)

      assert.equal(await lock.getHasValidKey(accountWithNoKey2), false)
      expirationBefore = await lock.keyExpirationTimestampFor(tokenIds[2])
      fee = await lock.getTransferFee(tokenIds[2], ONE_DAY)

      tx = await lock.shareKey(accountWithNoKey2, tokenIds[2], ONE_DAY, {
        from: keyOwners[2],
      })

      // fetch new token Id
      const { args } = tx.logs.find((v) => v.event === 'Transfer')
      ;({ tokenId: newTokenId } = args)
      ;({ timestamp: timestampAfter } = await ethers.provider.getBlock(
        'latest'
      ))
    })

    describe('events', () => {
      it('should emit the ExpirationChanged event', async () => {
        const expirationAfter = await lock.keyExpirationTimestampFor(
          tokenIds[2]
        )
        const { args } = tx.logs.find(
          ({ event }) => event === 'ExpirationChanged'
        )
        assert.equal(args.timeAdded, false)
        assert.equal(args.tokenId.toNumber(), tokenIds[2].toNumber())
        assert.equal(args.newExpiration.toString(), expirationAfter.toString())
        assert.equal(
          args.amount.toString(),
          expirationBefore.sub(expirationAfter).toString()
        )
      })

      it('should emit Transfer events', async () => {
        const transfers = tx.logs.filter(({ event }) => event === 'Transfer')
        assert.equal(transfers.length, 2)

        // issuer mint a new token
        assert.equal(transfers[0].args.from, ADDRESS_ZERO)
        assert.equal(transfers[0].args.to, accountWithNoKey2)
        assert.equal(
          transfers[0].args.tokenId.toString(),
          newTokenId.toString()
        )
        // issuer send the token to destination account
        assert.equal(transfers[1].args.from, keyOwners[2])
        assert.equal(transfers[1].args.to, accountWithNoKey2)
        assert.equal(
          transfers[1].args.tokenId.toString(),
          newTokenId.toString()
        )
      })
    })

    describe('original key', () => {
      it('should subtract the time shared + fee from the original key', async () => {
        const toSubstract = ONE_DAY.add(fee.toString())
        const expirationAfter = await lock.keyExpirationTimestampFor(
          tokenIds[2]
        )
        assert.equal(
          expirationAfter.toString(),
          ethers.BigNumber.from(expirationBefore.toString())
            .sub(toSubstract)
            .toString()
        )
      })

      it('should preserve ownership record', async () => {
        assert.equal(await lock.ownerOf(tokenIds[2]), keyOwners[2])
      })
    })

    describe('new key', () => {
      it('should create a new key and add the time shared to it', async () => {
        const sharedKeyExpiration = await lock.keyExpirationTimestampFor(
          newTokenId
        )
        assert.equal(await lock.isValidKey(newTokenId), true)
        assert.equal(await lock.getHasValidKey(accountWithNoKey2), true)
        assert.equal(
          sharedKeyExpiration.toString(),
          ONE_DAY.add(timestampAfter).toString()
        )
      })
      it('should create new ownership record', async () => {
        assert.equal(await lock.ownerOf(newTokenId), accountWithNoKey2)
        assert.equal(await lock.totalKeys(accountWithNoKey2), 1)
        assert.equal(await lock.balanceOf(accountWithNoKey2), 1)
      })
    })
  })
})
