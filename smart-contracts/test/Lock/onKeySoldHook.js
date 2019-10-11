const deployLocks = require('../helpers/deployLocks')

const unlockContract = artifacts.require('Unlock.sol')
const testKeySoldHookContract = artifacts.require('TestKeySoldHook.sol')
const getProxy = require('../helpers/proxy')

let lock, locks, unlock, testKeySoldHook

contract('Lock / onKeySoldHook', accounts => {
  const from = accounts[1]
  const to = accounts[2]
  const dataField = web3.utils.asciiToHex('TestData')
  let keyPrice

  before(async () => {
    unlock = await getProxy(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
    lock = locks['FIRST']
    testKeySoldHook = await testKeySoldHookContract.new()
    await lock.updateBeneficiary(testKeySoldHook.address)
    keyPrice = await lock.keyPrice()
    await lock.purchase(0, to, web3.utils.padLeft(0, 40), dataField, {
      from,
      value: keyPrice,
    })
  })

  it('key sales should log the hook event', async () => {
    const log = (await testKeySoldHook.getPastEvents('OnKeySold'))[0]
      .returnValues
    assert.equal(log.lock, lock.address)
    assert.equal(log.from, from)
    assert.equal(log.to, to)
    assert.equal(log.referrer, web3.utils.padLeft(0, 40))
    assert.equal(log.pricePaid, keyPrice.toString())
    assert.equal(log.data, dataField)
  })
})
