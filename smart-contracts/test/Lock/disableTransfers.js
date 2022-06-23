const BigNumber = require('bignumber.js')
const { reverts } = require('../helpers/errors')
const deployLocks = require('../helpers/deployLocks')
const { ADDRESS_ZERO } = require('../helpers/constants')

const unlockContract = artifacts.require('Unlock.sol')
const getContractInstance = require('../helpers/truffle-artifacts')

let unlock
let locks

contract('Lock / disableTransfers', (accounts) => {
  before(async () => {
    unlock = await getContractInstance(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
  })

  let lock
  let tokenId
  const keyOwner = accounts[1]
  const accountWithNoKey = accounts[2]
  const keyPrice = new BigNumber(web3.utils.toWei('0.01', 'ether'))
  const oneDay = new BigNumber(60 * 60 * 24)

  before(async () => {
    lock = locks.FIRST
    const tx = await lock.purchase(
      [],
      [keyOwner],
      [ADDRESS_ZERO],
      [ADDRESS_ZERO],
      [[]],
      {
        value: keyPrice.toFixed(),
        from: keyOwner,
      }
    )
    // Change the fee to 100%
    await lock.updateTransferFee(10000)
    const tokenIds = tx.logs
      .filter((v) => v.event === 'Transfer')
      .map(({ args }) => args.tokenId)
    tokenId = tokenIds[0]
  })

  describe('setting fee to 100%', () => {
    describe('disabling transferFrom', () => {
      it('should prevent key transfers by reverting', async () => {
        // check owner has a key
        assert.equal(await lock.getHasValidKey.call(keyOwner), true)
        // try to transfer it
        await reverts(
          lock.transferFrom(keyOwner, accountWithNoKey, tokenId, {
            from: keyOwner,
          }),
          'KEY_TRANSFERS_DISABLED'
        )
        // check owner still has a key
        assert.equal(await lock.getHasValidKey.call(keyOwner), true)
        // check recipient never received a key
        assert.equal(
          await lock.keyExpirationTimestampFor.call(accountWithNoKey, {
            from: accountWithNoKey,
          }),
          0
        )
      })
    })

    describe('disabling setApprovalForAll', () => {
      it('should prevent user from setting setApprovalForAll', async () => {
        await reverts(
          lock.setApprovalForAll(accounts[8], true, {
            from: keyOwner,
          }),
          'KEY_TRANSFERS_DISABLED'
        )
      })
    })

    describe('disabling shareKey', () => {
      it('should prevent key sharing by reverting', async () => {
        // check owner has a key
        assert.equal(await lock.getHasValidKey.call(keyOwner), true)
        // try to share it
        await reverts(
          lock.shareKey(accountWithNoKey, tokenId, oneDay, {
            from: keyOwner,
          }),
          'KEY_TRANSFERS_DISABLED'
        )
        // check owner still has a key
        assert.equal(await lock.getHasValidKey.call(keyOwner), true)
        // check recipient never received a key
        assert.equal(
          await lock.keyExpirationTimestampFor.call(accountWithNoKey, {
            from: accountWithNoKey,
          }),
          0
        )
      })
    })
  })

  describe('Re-enabling transfers', () => {
    it('lock owner should be able to allow transfers by lowering fee', async () => {
      // Change the fee to 99%
      await lock.updateTransferFee(1000)
      // check owner has a key
      assert.equal(await lock.getHasValidKey.call(keyOwner), true)
      assert.equal(await lock.getHasValidKey.call(accountWithNoKey), false)
      // attempt a transfer
      await lock.transferFrom(keyOwner, accountWithNoKey, tokenId, {
        from: keyOwner,
      })
      // check that recipient received a key
      assert.equal(await lock.getHasValidKey.call(accountWithNoKey), true)
    })
  })
})
