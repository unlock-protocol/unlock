const { reverts } = require('../helpers/errors')
const deployLocks = require('../helpers/deployLocks')

const unlockContract = artifacts.require('Unlock.sol')
const TestEventHooks = artifacts.require('TestEventHooks.sol')
const getContractInstance = require('../helpers/truffle-artifacts')
const { ADDRESS_ZERO } = require('../helpers/constants')

let lock
let locks
let unlock
let testEventHooks

contract('Lock / onKeyCancelHook', (accounts) => {
  const from = accounts[1]
  const to = accounts[2]
  let keyPrice

  before(async () => {
    unlock = await getContractInstance(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
    lock = locks.FIRST
    testEventHooks = await TestEventHooks.new()
    await lock.setEventHooks(
      ADDRESS_ZERO,
      testEventHooks.address,
      ADDRESS_ZERO,
      ADDRESS_ZERO
    )
    keyPrice = await lock.keyPrice()
    const tx = await lock.purchase(
      [],
      [to],
      [ADDRESS_ZERO],
      [ADDRESS_ZERO],
      [[]],
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
      lock.setEventHooks(ADDRESS_ZERO, accounts[1], ADDRESS_ZERO, ADDRESS_ZERO),
      'INVALID_HOOK(1)'
    )
  })
})
