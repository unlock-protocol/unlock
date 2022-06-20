const { deployERC20 } = require('../helpers')
const { reverts } = require('../helpers/errors')
const BigNumber = require('bignumber.js')
const { time } = require('@openzeppelin/test-helpers')
const { assert } = require('chai')
const deployLocks = require('../helpers/deployLocks')
const getContractInstance = require('../helpers/truffle-artifacts')
const { ADDRESS_ZERO } = require('../helpers/constants')

const Unlock = artifacts.require('Unlock.sol')

let unlock
let locks
let dai

const keyPrice = new BigNumber(web3.utils.toWei('0.01', 'ether'))
const newPrice = web3.utils.toWei('0.011', 'ether')
const totalPrice = keyPrice.times(10)
const someDai = new BigNumber(web3.utils.toWei('100', 'ether'))

let lock
contract('Lock / Extend with recurring memberships', (accounts) => {
  const lockOwner = accounts[0]
  const keyOwner = accounts[1]
  // const referrer = accounts[3]

  before(async () => {
    dai = await deployERC20(lockOwner)

    // Mint some dais for testing
    await dai.mint(keyOwner, someDai, {
      from: lockOwner,
    })

    unlock = await getContractInstance(Unlock)
    locks = await deployLocks(unlock, lockOwner, dai.address)
    lock = locks.ERC20
    await lock.setMaxKeysPerAddress(10)

    // set ERC20 approval for entire scope
    await dai.approve(lock.address, someDai, {
      from: keyOwner,
    })
  })

  describe('Use extend() to restart recurring payments', () => {
    let tokenId
    beforeEach(async () => {
      // reset pricing
      await lock.updateKeyPricing(keyPrice, dai.address, { from: lockOwner })

      const tx = await lock.purchase(
        [keyPrice],
        [keyOwner],
        [ADDRESS_ZERO],
        [ADDRESS_ZERO],
        [[]],
        { from: keyOwner }
      )

      const { args } = tx.logs.find((v) => v.event === 'Transfer')
      const { tokenId: newTokenId } = args
      tokenId = newTokenId

      const expirationTs = await lock.keyExpirationTimestampFor(tokenId)
      await time.increaseTo(expirationTs.toNumber())

      // renew once
      await lock.renewMembershipFor(tokenId, ADDRESS_ZERO, {
        from: keyOwner,
      })
    })

    describe('price changed', () => {
      it('should renew once key has been extended', async () => {
        // change price
        await lock.updateKeyPricing(newPrice, dai.address, { from: lockOwner })

        // fails because price has changed
        await reverts(
          lock.renewMembershipFor(tokenId, ADDRESS_ZERO),
          'LOCK_HAS_CHANGED'
        )

        // user extend key
        await lock.extend(newPrice, tokenId, ADDRESS_ZERO, [], {
          from: keyOwner,
        })

        // expire key again
        const newExpirationTs = await lock.keyExpirationTimestampFor(tokenId)

        // renewal should work
        await time.increaseTo(newExpirationTs.toNumber() - 1)
        await lock.renewMembershipFor(tokenId, ADDRESS_ZERO, {
          from: keyOwner,
        })
        const tsAfter = await lock.keyExpirationTimestampFor(tokenId)
        assert.equal(
          newExpirationTs.add(await lock.expirationDuration()).toString(),
          tsAfter.toString()
        )
      })
    })

    describe('duration changed', () => {
      it('should renew once key has been extended', async () => {
        // change duration
        await lock.setExpirationDuration(6000, { from: lockOwner })

        // fails because price has changed
        await reverts(
          lock.renewMembershipFor(tokenId, ADDRESS_ZERO),
          'LOCK_HAS_CHANGED'
        )

        // user extend key
        await lock.extend(keyPrice, tokenId, ADDRESS_ZERO, [], {
          from: keyOwner,
        })

        // expire key again
        const newExpirationTs = await lock.keyExpirationTimestampFor(tokenId)

        // renewal should work
        await time.increaseTo(newExpirationTs.toNumber() - 1)
        await lock.renewMembershipFor(tokenId, ADDRESS_ZERO, {
          from: keyOwner,
        })
        const tsAfter = await lock.keyExpirationTimestampFor(tokenId)
        assert.equal(
          newExpirationTs.add(await lock.expirationDuration()).toString(),
          tsAfter.toString()
        )
      })
    })

    describe('token changed', () => {
      it('should renew once key has been extended', async () => {
        // deploy a new erc20 token
        const xdai = await deployERC20(lockOwner)
        await xdai.mint(keyOwner, someDai, {
          from: lockOwner,
        })
        await xdai.approve(lock.address, totalPrice, {
          from: keyOwner,
        })

        // change pricing to use new erc20
        await lock.updateKeyPricing(keyPrice, xdai.address, { from: lockOwner })

        // fails because token has changed
        await reverts(
          lock.renewMembershipFor(tokenId, ADDRESS_ZERO),
          'LOCK_HAS_CHANGED'
        )

        // user extend key
        await lock.extend(keyPrice, tokenId, ADDRESS_ZERO, [], {
          from: keyOwner,
        })

        // expire key again
        const newExpirationTs = await lock.keyExpirationTimestampFor(tokenId)

        // renewal should work
        await time.increaseTo(newExpirationTs.toNumber() - 1)
        await lock.renewMembershipFor(tokenId, ADDRESS_ZERO, {
          from: keyOwner,
        })
        const tsAfter = await lock.keyExpirationTimestampFor(tokenId)
        assert.equal(
          newExpirationTs.add(await lock.expirationDuration()).toString(),
          tsAfter.toString()
        )
      })
    })
  })
})
