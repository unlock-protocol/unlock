const { ethers } = require('hardhat')
const { reverts, deployLock, ADDRESS_ZERO } = require('../helpers')

let lock
let tx

contract('Lock / grantKeys', (accounts) => {
  const lockCreator = accounts[1]
  const keyOwner = accounts[2]
  let validExpirationTimestamp

  before(async () => {
    const blockNumber = await ethers.provider.getBlockNumber()
    const latestBlock = await ethers.provider.getBlock(blockNumber)
    validExpirationTimestamp = Math.round(latestBlock.timestamp + 600)
    lock = await deployLock({ from: lockCreator })
  })

  describe('can grant key(s)', () => {
    describe('can grant a key for a new user', () => {
      let evt
      before(async () => {
        // the lock creator is assigned the KeyGranter role by default
        tx = await lock.grantKeys(
          [keyOwner],
          [validExpirationTimestamp],
          [ADDRESS_ZERO],
          {
            from: lockCreator,
          }
        )
        evt = tx.logs.find((v) => v.event === 'Transfer')
      })

      it('should log Transfer event', async () => {
        assert.equal(evt.event, 'Transfer')
        assert.equal(evt.args.from, 0)
        assert.equal(evt.args.to, accounts[2])
      })

      it('should acknowledge that user owns key', async () => {
        assert.equal(await lock.ownerOf(evt.args.tokenId), keyOwner)
      })

      it('getHasValidKey is true', async () => {
        assert.equal(await lock.getHasValidKey(keyOwner), true)
      })
    })

    describe('bulk grant keys', () => {
      const keyOwnerList = [accounts[3], accounts[4], accounts[5]]

      it('should fail to grant keys when expiration dates are missing', async () => {
        await reverts(
          lock.grantKeys(
            keyOwnerList,
            [validExpirationTimestamp],
            [ADDRESS_ZERO],
            {
              from: lockCreator,
            }
          ),
          `panic code 0x32`
        )
      })
    })

    it('can bulk grant keys using unique expiration dates', async () => {
      const keyOwnerList = [accounts[6], accounts[7]]
      const expirationDates = [
        validExpirationTimestamp,
        validExpirationTimestamp + 42,
      ]

      before(async () => {
        tx = await lock.methods['grantKeys(uint256[],uint256[])'](
          keyOwnerList,
          expirationDates,
          { from: lockCreator }
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
          [ADDRESS_ZERO],
          {
            from: lockCreator,
          }
        ),
        'INVALID_ADDRESS'
      )
    })

    // By default, the lockCreator has both the LockManager & KeyGranter roles
    it('should fail if called by anyone but LockManager or KeyGranter', async () => {
      await reverts(
        lock.grantKeys([keyOwner], [validExpirationTimestamp], [ADDRESS_ZERO], {
          from: keyOwner,
        })
      )

      await reverts(
        lock.grantKeys([keyOwner], [validExpirationTimestamp], [ADDRESS_ZERO], {
          from: accounts[9],
        })
      )
    })
  })
})
