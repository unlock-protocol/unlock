const { assert } = require('chai')
const { ethers } = require('hardhat')
const { reverts, deployLock, ADDRESS_ZERO } = require('../helpers')

let lock
let tx

describe('Lock / grantKeys', () => {
  let keyOwner, attacker, signers
  let validExpirationTimestamp

  before(async () => {
    ;[, keyOwner, attacker, ...signers] = await ethers.getSigners()
    const blockNumber = await ethers.provider.getBlockNumber()
    const latestBlock = await ethers.provider.getBlock(blockNumber)
    validExpirationTimestamp = Math.round(latestBlock.timestamp + 600)
    lock = await deployLock()
  })

  describe('can grant key(s)', () => {
    describe('can grant a key for a new user', () => {
      let args
      before(async () => {
        // the lock creator is assigned the KeyGranter role by default
        tx = await lock.grantKeys(
          [keyOwner.address],
          [validExpirationTimestamp],
          [ADDRESS_ZERO]
        )
        const { events } = await tx.wait()
        ;({ args } = events.find(({ event }) => event === 'Transfer'))
      })

      it('should log Transfer event', async () => {
        assert.equal(args.from, 0)
        assert.equal(args.to, keyOwner.address)
      })

      it('should acknowledge that user owns key', async () => {
        assert.equal(await lock.ownerOf(args.tokenId), keyOwner.address)
      })

      it('getHasValidKey is true', async () => {
        assert.equal(await lock.getHasValidKey(keyOwner.address), true)
      })
    })

    describe('bulk grant keys', () => {
      let keyOwnerList

      before(async () => {
        keyOwnerList = signers.map(({ address }) => address).splice(4, 6)
      })

      it('should fail to grant keys when expiration dates are missing', async () => {
        await reverts(
          lock.grantKeys(
            keyOwnerList,
            [validExpirationTimestamp],
            [ADDRESS_ZERO]
          ),
          `panic code 0x32`
        )
      })

      it('can bulk grant keys using unique expiration dates', async () => {
        const expirationDates = keyOwnerList.map(
          (k, i) => validExpirationTimestamp + i * 3
        )

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
          .connect(attacker)
          .grantKeys(
            [keyOwner.address],
            [validExpirationTimestamp],
            [ADDRESS_ZERO]
          ),
        'ONLY_LOCK_MANAGER_OR_KEY_GRANTER'
      )
    })
  })
})
