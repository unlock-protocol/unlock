const deployLocks = require('../helpers/deployLocks')

const unlockContract = artifacts.require('Unlock.sol')
const testKeySoldHookContract = artifacts.require('TestKeySoldHook.sol')
const getProxy = require('../helpers/proxy')

let lock, locks, unlock, testKeySoldHook

contract('Lock / onKeyCancelHook', accounts => {
  const from = accounts[1]
  const to = accounts[2]
  let keyPrice

  before(async () => {
    unlock = await getProxy(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
    lock = locks['FIRST']
    testKeySoldHook = await testKeySoldHookContract.new()
    await lock.updateBeneficiary(testKeySoldHook.address)
    keyPrice = await lock.keyPrice()
    await lock.purchase(0, to, web3.utils.padLeft(0, 40), [], {
      from,
      value: keyPrice,
    })
    await lock.cancelAndRefund({ from: to })
  })

  it('key cancels should log the hook event', async () => {
    const log = (await testKeySoldHook.getPastEvents('OnKeyCancel'))[0]
      .returnValues
    assert.equal(log.lock, lock.address)
    assert.equal(log.operator, to)
    assert.equal(log.to, to)
    assert.notEqual(log.refund, 0)
  })
})
