const deployLocks = require('../helpers/deployLocks')

const unlockContract = artifacts.require('Unlock.sol')
const getProxy = require('../helpers/proxy')

let unlock
let locks
let tokenId

contract('Lock / isValidKey', (accounts) => {
  let keyOwner = accounts[1]
  let lock

  beforeEach(async () => {
    unlock = await getProxy(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
    lock = locks.FIRST
    await lock.updateTransferFee(0) // disable the transfer fee for this test
    const tx = await lock.purchase(
      [],
      [keyOwner],
      [web3.utils.padLeft(0, 40)],
      [web3.utils.padLeft(0, 40)],
      [],
      {
        value: web3.utils.toWei('0.01', 'ether'),
      }
    )
    const tokenIds = tx.logs
      .filter((v) => v.event === 'Transfer')
      .map(({ args }) => args.tokenId)
    tokenId = tokenIds[0]
  })

  it('should be false if the key does not exist', async () => {
    assert.equal(await lock.isValidKey(123), false)
  })

  it('should be true after purchase', async () => {
    assert.equal(await lock.isValidKey.call(tokenId), true)
  })

  it('should still be true after transfering', async () => {
    await lock.transferFrom(keyOwner, accounts[5], tokenId, {
      from: keyOwner,
    })
    assert.equal(await lock.isValidKey.call(tokenId), true)
  })

  it('should be false after expiring', async () => {
    await lock.expireAndRefundFor(tokenId, 0, {
      from: accounts[0],
    })
    assert.equal(await lock.isValidKey.call(tokenId), false)
  })

  it('should be false after cancelling', async () => {
    await lock.cancelAndRefund(tokenId, {
      from: keyOwner,
    })
    assert.equal(await lock.isValidKey.call(tokenId), false)
  })
})
