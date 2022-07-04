const { ethers } = require('hardhat')
const { assert } = require('chai')
const { reverts, deployLock, ADDRESS_ZERO } = require('../helpers')

describe('Lock / grantKeys', () => {
  let tx
  let lock
  let keyOwner
  let accounts
  let validExpirationTimestamp

  before(async () => {
    const blockNumber = await ethers.p
    const [, ...signers] = await ethers.getSigners()
    keyOwner = signers[1]
    accounts = signers

    const latestBlock = await ethers.provider.getBlock(blockNumber)
    validExpirationTimestamp = Math.round(latestBlock.timestamp + 600)
    lock = await deployLock()
  })

  describe('can grant key(s)', () => {
    describe('can grant a key for a new user', () => {
      let evt
      before(async () => {
        // the lock creator is assigned the KeyGranter role by default
        tx = await lock.grantKeys(
          [keyOwner.address],
          [validExpirationTimestamp],
          [ADDRESS_ZERO]
        )
        const { events } = await tx.wait()
        evt = events.find((v) => v.event === 'Transfer')
      })

      it('should log Transfer event', async () => {
        assert.equal(evt.event, 'Transfer')
        assert.equal(evt.args.from, 0)
        assert.equal(evt.args.to, keyOwner.address)
      })

      it('should acknowledge that user owns key', async () => {
        assert.equal(await lock.ownerOf(evt.args.tokenId), keyOwner.address)
      })

      it('getHasValidKey is true', async () => {
        assert.equal(await lock.getHasValidKey(keyOwner.address), true)
      })
    })

    describe('bulk grant keys', () => {
      it('should fail to grant keys when expiration dates are missing', async () => {
        await reverts(
          lock.grantKeys(
            accounts.slice(2, 4).map(({ address }) => address),
            [validExpirationTimestamp],
            [ADDRESS_ZERO]
          ),
          `reverted with panic code 0x32 (Array accessed at an out-of-bounds or negative index)`
        )
      })
    })

    it('can bulk grant keys using unique expiration dates', async () => {
      const keyOwnerList = accounts.slice(2, 4).map(({ address }) => address)
      const expirationDates = [
        validExpirationTimestamp,
        validExpirationTimestamp + 42,
      ]

      before(async () => {
        tx = await lock.methods['grantKeys(uint256[],uint256[])'](
          keyOwnerList,
          expirationDates
        )
      })

      it('should acknowledge that user owns key', async () => {
        for (let i = 0; i < keyOwnerList.length; i++) {
          assert.equal(await lock.balanceOf(keyOwnerList[i]), 1)
        }
      })

      it('getHasValidKey is true', async () => {
        for (let i = 0; i < keyOwnerList.length; i++) {
          assert.equal(await lock.getHasValidKey(keyOwnerList[i]), true)
        }
      })
    })
  })

  describe('should fail', () => {
    it('should fail to grant key to the 0 address', async () => {
      await reverts(
        lock.grantKeys(
          [ADDRESS_ZERO],
          [validExpirationTimestamp],
          [ADDRESS_ZERO]
        ),
        'INVALID_ADDRESS'
      )
    })

    // By default, the lockCreator has both the LockManager & KeyGranter roles
    it('should fail if called by anyone but LockManager or KeyGranter', async () => {
      await reverts(
        lock
          .connect(keyOwner)
          .grantKeys(
            [keyOwner.address],
            [validExpirationTimestamp],
            [ADDRESS_ZERO]
          )
      )

      await reverts(
        lock
          .connect(accounts[9])
          .grantKeys(
            [keyOwner.address],
            [validExpirationTimestamp],
            [ADDRESS_ZERO]
          )
      )
    })
  })
})
