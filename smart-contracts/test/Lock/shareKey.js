const { ethers } = require('hardhat')
const BigNumber = require('bignumber.js')

const { reverts } = require('../helpers/errors')
const deployLocks = require('../helpers/deployLocks')
const { ADDRESS_ZERO } = require('../helpers/constants')

const unlockContract = artifacts.require('Unlock.sol')
const getContractInstance = require('../helpers/truffle-artifacts')

let unlock
let locks
let tokenIds

contract('Lock / shareKey', (accounts) => {
  let lock
  let event
  let event1
  let event2
  let tx2

  const keyOwners = [accounts[1], accounts[2], accounts[3]]
  const accountWithNoKey2 = accounts[5]
  const accountWithNoKey3 = accounts[6]
  const approvedAddress = accounts[7]
  const keyPrice = ethers.utils.parseUnits('0.01', 'ether')

  beforeEach(async () => {
    unlock = await getContractInstance(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
    lock = locks.FIRST
    await lock.setMaxKeysPerAddress(10)
    const tx = await lock.purchase(
      [],
      keyOwners,
      keyOwners.map(() => ADDRESS_ZERO),
      keyOwners.map(() => ADDRESS_ZERO),
      keyOwners.map(() => []),
      {
        value: (keyPrice * keyOwners.length).toFixed(),
        from: keyOwners[0],
      }
    )

    tokenIds = tx.logs
      .filter((v) => v.event === 'Transfer')
      .map(({ args }) => args.tokenId)
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

      it('should abort if the key owner', async () => {
        await reverts(
          lock.shareKey(keyOwners[0], tokenIds[0], 1000, {
            from: keyOwners[0],
          }),
          'TRANSFER_TO_SELF'
        )
      })

      it('should revert if keys are sold out', async () => {
        const buyers = accounts.slice(3, 10)
        await lock.purchase(
          [],
          buyers,
          buyers.map(() => ADDRESS_ZERO),
          buyers.map(() => ADDRESS_ZERO),
          buyers.map(() => []),
          {
            value: (keyPrice * buyers.length).toFixed(),
            from: keyOwners[0],
          }
        )

        await reverts(
          lock.shareKey(keyOwners[0], tokenIds[0], 1000, {
            from: keyOwners[0],
          }),
          'LOCK_SOLD_OUT'
        )
      })
    })

    it('should fail if trying to share a key with a contract which does not implement onERC721Received', async () => {
      let nonCompliantContract = unlock.address
      assert.equal(await lock.isValidKey(tokenIds[2]), true)
      assert.equal(await lock.ownerOf(tokenIds[2]), keyOwners[2])
      await reverts(
        lock.shareKey(nonCompliantContract, tokenIds[2], 1000, {
          from: keyOwners[2],
        })
      )
      // make sure the key was not shared
      assert.notEqual(await lock.ownerOf(tokenIds[2]), nonCompliantContract)
    })

    describe('fallback behaviors', () => {
      let remaining
      let tx

      beforeEach(async () => {
        const tooMuchTime = new BigNumber(60 * 60 * 24 * 30 * 2) // 60 days
        assert.equal(await lock.isValidKey(tokenIds[1]), true)

        remaining = await lock.keyExpirationTimestampFor(tokenIds[1])
        assert.equal(await lock.balanceOf(accounts[4]), 0)

        tx = await lock.shareKey(accounts[4], tokenIds[1], tooMuchTime, {
          from: keyOwners[1],
        })
      })

      it('transfers all remaining time if amount to share >= remaining time', async () => {
        const { args } = tx.logs.find((v) => v.event === 'Transfer')
        assert.equal(await lock.isValidKey(args.tokenId), true)

        // new owner now has a fresh key
        assert.equal(await lock.balanceOf(accounts[4]), 1)
        assert.equal(await lock.getHasValidKey(accounts[4]), true)

        let newExpirationTimestamp = new BigNumber(
          await lock.keyExpirationTimestampFor(args.tokenId)
        )
        assert.equal(newExpirationTimestamp.toString(), remaining.toString())
      })

      it('should emit the expireKey Event', async () => {
        assert.equal(tx.logs[0].event, 'ExpireKey')
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

  describe('successful key sharing', () => {
    let oneDay = new BigNumber(60 * 60 * 24)
    let hadKeyBefore
    let expirationBeforeSharing
    let expirationAfterSharing
    let sharedKeyExpiration
    let fee
    let timestampBeforeSharing
    let timestampAfterSharing
    let newTokenId

    beforeEach(async () => {
      // Change the fee to 5%
      await lock.updateTransferFee(500)
      // approve an address
      await lock.approve(approvedAddress, tokenIds[2], {
        from: keyOwners[2],
      })

      hadKeyBefore = await lock.getHasValidKey(accountWithNoKey2)
      expirationBeforeSharing = new BigNumber(
        await lock.keyExpirationTimestampFor(tokenIds[2])
      )

      timestampBeforeSharing = await ethers.provider.getBlock('latest')
        .timestamp
      fee = new BigNumber(await lock.getTransferFee(tokenIds[2], oneDay))

      tx2 = await lock.shareKey(accountWithNoKey2, tokenIds[2], oneDay, {
        from: keyOwners[2],
      })
      event = tx2.logs[0].event
      event1 = tx2.logs[1].event
      event2 = tx2.logs[2].event
      const { tokenId } = tx2.logs[2].args
      newTokenId = tokenId
    })

    it('should emit the ExpirationChanged event', async () => {
      assert.equal(event, 'ExpirationChanged')
      assert.equal(tx2.logs[0].args._timeAdded, false)
    })

    it('should emit the Transfer event', async () => {
      assert.equal(event1, 'Transfer')
      assert.equal(event2, 'Transfer')
    })

    it('should subtract the time shared + fee from the key owner', async () => {
      expirationAfterSharing = new BigNumber(
        await lock.keyExpirationTimestampFor(tokenIds[2])
      )
      assert(
        expirationAfterSharing.eq(
          expirationBeforeSharing.minus(fee).minus(oneDay)
        )
      )
    })

    it('should create a new key and add the time shared to it', async () => {
      assert.equal(await lock.getHasValidKey(accountWithNoKey2), true)

      sharedKeyExpiration = new BigNumber(
        await lock.keyExpirationTimestampFor(newTokenId)
      )
      let currentTimestamp = await ethers.provider.getBlock('latest').timestamp
      assert.equal(hadKeyBefore, false)
      assert(sharedKeyExpiration.eq(currentTimestamp.plus(oneDay)))
    })

    it('should not assign the recipient of the granted key as the owner of tokenId 0', async () => {
      const zeroOwner = await lock.ownerOf(0)
      assert.equal(zeroOwner, ADDRESS_ZERO)
    })

    it('total time remaining is <= original time + fee', async () => {
      timestampAfterSharing = await ethers.provider.getBlock('latest').timestamp
      let timeRemainingBefore = expirationBeforeSharing.minus(
        timestampBeforeSharing
      )
      let totalTimeRemainingAfter = expirationAfterSharing
        .minus(timestampAfterSharing)
        .plus(sharedKeyExpiration.minus(timestampAfterSharing))

      assert(timeRemainingBefore.minus(fee).gte(totalTimeRemainingAfter))
    })

    it('should allow an approved address to share a key', async () => {
      // make sure recipient does not have a key
      assert.equal(await lock.getHasValidKey(accountWithNoKey3), false)
      const tx = await lock.shareKey(accountWithNoKey3, tokenIds[2], oneDay, {
        from: approvedAddress,
      })
      // make sure recipient has a key
      const { args } = tx.logs.find((v) => v.event === 'Transfer')
      assert.equal(await lock.ownerOf(args.tokenId), accountWithNoKey3)
    })
  })
})
