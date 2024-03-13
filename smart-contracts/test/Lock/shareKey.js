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

describe('Lock / shareKey', () => {
  let lock
  let tokenIds

  let signers
  let keyOwners

  beforeEach(async () => {
    signers = await ethers.getSigners()
    lock = await deployLock({ isEthers: true })
    ;({ tokenIds, keyOwners } = await purchaseKeys(lock, 3))
    keyOwners = await Promise.all(
      keyOwners.map(async (s) => await ethers.getSigner(s))
    )
  })

  describe('failing to share a key', () => {
    describe('not meeting pre-requisites', () => {
      it('sender is not approved', async () => {
        await reverts(
          lock.connect(signers[4]).shareKey(signers[7].address, 11, 1000),
          'ONLY_KEY_MANAGER_OR_APPROVED'
        )
      })

      it('called by other than keyOwner or approved ', async () => {
        await reverts(
          lock
            .connect(signers[6])
            .shareKey(signers[3].address, tokenIds[0], 1000),
          'ONLY_KEY_MANAGER_OR_APPROVED'
        )
      })

      it('should abort if the recipient is 0x', async () => {
        await reverts(
          lock.connect(keyOwners[0]).shareKey(ADDRESS_ZERO, tokenIds[0], 1000),
          'INVALID_ADDRESS'
        )
      })

      it('should revert if keys are sold out', async () => {
        await purchaseKeys(lock, 7)
        await reverts(
          lock
            .connect(keyOwners[0])
            .shareKey(keyOwners[0].address, tokenIds[0], 1000),
          'LOCK_SOLD_OUT'
        )
      })
    })

    it('should fail if trying to share a key with a contract which does not implement onERC721Received', async () => {
      // A contract which does NOT implement onERC721Received:
      const NonCompliantContract = await ethers.getContractFactory(
        'TestEventHooks'
      )
      const { address } = await NonCompliantContract.deploy()

      assert.equal(await lock.isValidKey(tokenIds[2]), true)
      assert.equal(await lock.ownerOf(tokenIds[2]), keyOwners[2].address)
      await reverts(
        lock.connect(keyOwners[2]).shareKey(address, tokenIds[2], 1000)
      )
      // make sure the key was not shared
      assert.notEqual(await lock.ownerOf(tokenIds[2]), address)
    })

    describe('fallback behaviors', () => {
      let remaining
      let events
      let newOwner

      beforeEach(async () => {
        ;({ address: newOwner } = signers[5])

        assert.equal(await lock.isValidKey(tokenIds[1]), true)
        remaining = await lock.keyExpirationTimestampFor(tokenIds[1])
        assert.equal(await lock.balanceOf(newOwner), 0)

        const tx = await lock
          .connect(keyOwners[1])
          .shareKey(newOwner, tokenIds[1], TOO_MUCH_TIME)

        ;({ events } = await tx.wait())
      })

      it('transfers all remaining time if amount to share >= remaining time', async () => {
        const { args } = events.find((v) => v.event === 'Transfer')
        assert.equal(await lock.isValidKey(args.tokenId), true)

        // new owner now has a fresh key
        assert.equal(await lock.balanceOf(newOwner), 1)
        assert.equal(await lock.getHasValidKey(newOwner), true)

        let newExpirationTimestamp = await lock.keyExpirationTimestampFor(
          args.tokenId
        )
        assert.equal(newExpirationTimestamp.toString(), remaining.toString())
      })

      it('should emit the expireKey Event', async () => {
        const evt = events.find(({ event }) => event === 'ExpireKey')
        assert.equal(evt.args.tokenId.toString(), tokenIds[1].toString())
      })

      it('The origin key is expired', async () => {
        assert.equal(await lock.isValidKey(tokenIds[1]), false)
        assert.equal(await lock.getHasValidKey(keyOwners[1].address), false)
      })

      it('The original owner still owns their key', async () => {
        assert.equal(await lock.ownerOf(tokenIds[1]), keyOwners[1].address)
      })
    })
  })

  describe('approved account sharing a key', () => {
    let approvedAddress
    let accountWithNoKey3
    beforeEach(async () => {
      ;({ address: approvedAddress } = signers[7])
      ;({ address: accountWithNoKey3 } = signers[9])
      // approve an address
      await lock.connect(keyOwners[2]).approve(approvedAddress, tokenIds[2])
    })

    it('should allow an approved address to share a key', async () => {
      // make sure recipient does not have a key
      assert.equal(await lock.getHasValidKey(accountWithNoKey3), false)
      const tx = await lock
        .connect(await ethers.getSigner(approvedAddress))
        .shareKey(accountWithNoKey3, tokenIds[2], ONE_DAY)
      // make sure recipient has a key
      const { events } = await tx.wait()
      const { args } = events.find((v) => v.event === 'Transfer')
      assert.equal(await lock.ownerOf(args.tokenId), accountWithNoKey3)
    })
  })

  describe('successful key sharing', () => {
    let fee
    let events
    let timestampAfter
    let expirationBefore
    let newTokenId
    let accountWithNoKey2

    beforeEach(async () => {
      ;({ address: accountWithNoKey2 } = signers[8])
      // Change the fee to 5%
      await lock.updateTransferFee(500)

      assert.equal(await lock.getHasValidKey(accountWithNoKey2), false)
      expirationBefore = await lock.keyExpirationTimestampFor(tokenIds[2])
      fee = await lock.getTransferFee(tokenIds[2], ONE_DAY)

      const tx = await lock
        .connect(keyOwners[2])
        .shareKey(accountWithNoKey2, tokenIds[2], ONE_DAY)

      ;({ events } = await tx.wait())

      // fetch new token Id
      const { args } = events.find((v) => v.event === 'Transfer')
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
        const { args } = events.find(
          ({ event }) => event === 'ExpirationChanged'
        )
        assert.equal(args.tokenId.toString(), tokenIds[2].toString())
        assert.equal(
          args.prevExpiration.toString(),
          expirationBefore.toString()
        )
        assert.equal(args.newExpiration.toString(), expirationAfter.toString())
      })

      it('should emit Transfer events', async () => {
        const transfers = events.filter(({ event }) => event === 'Transfer')
        assert.equal(transfers.length, 2)

        // issuer mint a new token
        const { args: createKeyEventArgs } = transfers.find(
          ({ args: { from } }) => from === ADDRESS_ZERO
        )
        console.log(createKeyEventArgs)
        assert.equal(createKeyEventArgs.from, ADDRESS_ZERO)
        assert.equal(createKeyEventArgs.to, accountWithNoKey2)
        assert.equal(
          createKeyEventArgs.tokenId.toString(),
          newTokenId.toString()
        )

        // issuer send the token to destination account
        const { args: transferKeyEventArgs } = transfers.find(
          ({ args: { from } }) => from !== ADDRESS_ZERO
        )
        assert.equal(transferKeyEventArgs.from, keyOwners[2].address)
        assert.equal(transferKeyEventArgs.to, accountWithNoKey2)
        assert.equal(
          transferKeyEventArgs.tokenId.toString(),
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
          expirationBefore.sub(toSubstract).toString()
        )
      })

      it('should preserve ownership record', async () => {
        assert.equal(await lock.ownerOf(tokenIds[2]), keyOwners[2].address)
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
