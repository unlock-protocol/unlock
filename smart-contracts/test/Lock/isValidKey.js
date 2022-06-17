const deployLocks = require('../helpers/deployLocks')

const unlockContract = artifacts.require('Unlock.sol')
const getContractInstance = require('../helpers/truffle-artifacts')
const { purchaseKey } = require('../helpers')

let unlock
let locks
let tokenId

contract('Lock / isValidKey', (accounts) => {
  let keyOwner = accounts[1]
  let lock

  beforeEach(async () => {
    unlock = await getContractInstance(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
    lock = locks.FIRST
    await lock.updateTransferFee(0) // disable the transfer fee for this test
    ;({tokenId} = await purchaseKey(lock, keyOwner))
  })

  it('should be false if the key does not exist', async () => {
    assert.equal(await lock.isValidKey(123), false)
  })

  it('should be true after purchase', async () => {
    assert.equal(await lock.isValidKey(tokenId), true)
  })

  it('should still be true after transfering', async () => {
    await lock.transferFrom(keyOwner, accounts[5], tokenId, {
      from: keyOwner,
    })
    assert.equal(await lock.isValidKey(tokenId), true)
  })

  it('should be false after expiring', async () => {
    await lock.expireAndRefundFor(tokenId, 0, {
      from: accounts[0],
    })
    assert.equal(await lock.isValidKey(tokenId), false)
  })

  it('should be false after cancelling', async () => {
    await lock.cancelAndRefund(tokenId, {
      from: keyOwner,
    })
    assert.equal(await lock.isValidKey(tokenId), false)
  })
})
