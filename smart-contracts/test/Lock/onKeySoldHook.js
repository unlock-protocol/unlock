const { constants } = require('hardlydifficult-ethereum-contracts')
const deployLocks = require('../helpers/deployLocks')

const unlockContract = artifacts.require('Unlock.sol')
const TestEventHooks = artifacts.require('TestEventHooks.sol')
const getProxy = require('../helpers/proxy')

let lock
let locks
let unlock
let testEventHooks

contract('Lock / onKeySoldHook', accounts => {
  const from = accounts[1]
  const to = accounts[2]
  const dataField = web3.utils.asciiToHex('TestData')
  let keyPrice

  before(async () => {
    unlock = await getProxy(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
    lock = locks.FIRST
    testEventHooks = await TestEventHooks.new()
    await lock.setEventHooks(testEventHooks.address, constants.ZERO_ADDRESS)
    keyPrice = await lock.keyPrice()
    await lock.purchase(0, to, constants.ZERO_ADDRESS, dataField, {
      from,
      value: keyPrice,
    })
  })

  it('key sales should log the hook event', async () => {
    const log = (await testEventHooks.getPastEvents('OnKeySold'))[0]
      .returnValues
    assert.equal(log.lock, lock.address)
    assert.equal(log.from, from)
    assert.equal(log.to, to)
    assert.equal(log.referrer, web3.utils.padLeft(0, 40))
    assert.equal(log.pricePaid, keyPrice.toString())
    assert.equal(log.data, dataField)
  })
})
