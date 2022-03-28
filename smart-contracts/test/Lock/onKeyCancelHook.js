const { constants } = require('hardlydifficult-ethereum-contracts')
const { reverts } = require('truffle-assertions')
const deployLocks = require('../helpers/deployLocks')

const unlockContract = artifacts.require('Unlock.sol')
const TestEventHooks = artifacts.require('TestEventHooks.sol')
const getProxy = require('../helpers/proxy')

let lock
let locks
let unlock
let testEventHooks

contract('Lock / onKeyCancelHook', (accounts) => {
  const from = accounts[1]
  const to = accounts[2]
  let keyPrice

  before(async () => {
    unlock = await getProxy(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
    lock = locks.FIRST
    testEventHooks = await TestEventHooks.new()
    await lock.setEventHooks(
      constants.ZERO_ADDRESS,
      testEventHooks.address,
      constants.ZERO_ADDRESS,
      constants.ZERO_ADDRESS
    )
    keyPrice = await lock.keyPrice()
    const tx = await lock.purchase(
      [],
      [to],
      [constants.ZERO_ADDRESS],
      [constants.ZERO_ADDRESS],
      [],
      {
        from,
        value: keyPrice,
      }
    )
    const { args } = tx.logs.find((v) => v.event === 'Transfer')
    const tokenId = args.tokenId
    await lock.cancelAndRefund(tokenId, { from: to })
  })

  it('key cancels should log the hook event', async () => {
    const log = (await testEventHooks.getPastEvents('OnKeyCancel'))[0]
      .returnValues
    assert.equal(log.lock, lock.address)
    assert.equal(log.operator, to)
    assert.equal(log.to, to)
    assert.notEqual(log.refund, 0)
  })

  it('cannot set the hook to a non-contract address', async () => {
    await reverts(
      lock.setEventHooks(
        constants.ZERO_ADDRESS,
        accounts[1],
        constants.ZERO_ADDRESS,
        constants.ZERO_ADDRESS
      ),
      'INVALID_ON_KEY_CANCEL_HOOK'
    )
  })
})
