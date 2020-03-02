const { constants } = require('hardlydifficult-ethereum-contracts')
const deployLocks = require('../helpers/deployLocks')

const unlockContract = artifacts.require('Unlock.sol')
const TestEventHooks = artifacts.require('TestEventHooks.sol')
const getProxy = require('../helpers/proxy')

let lock
let locks
let unlock
let testEventHooks

contract('Lock / onKeyCancelHook', accounts => {
  const from = accounts[1]
  const to = accounts[2]
  let keyPrice

  before(async () => {
    unlock = await getProxy(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
    lock = locks.FIRST
    testEventHooks = await TestEventHooks.new()
    await lock.setEventHooks(constants.ZERO_ADDRESS, testEventHooks.address)
    keyPrice = await lock.keyPrice()
    await lock.purchase(0, to, constants.ZERO_ADDRESS, [], {
      from,
      value: keyPrice,
    })
    await lock.cancelAndRefund({ from: to })
  })

  it('key cancels should log the hook event', async () => {
    const log = (await testEventHooks.getPastEvents('OnKeyCancel'))[0]
      .returnValues
    assert.equal(log.lock, lock.address)
    assert.equal(log.operator, to)
    assert.equal(log.to, to)
    assert.notEqual(log.refund, 0)
  })
})
