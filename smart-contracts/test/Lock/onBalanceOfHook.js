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

contract('Lock / onBalanceOfHook', (accounts) => {
  const from = accounts[1]
  const to = accounts[2]

  before(async () => {
    unlock = await getProxy(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
    lock = locks.FIRST
    const keyPrice = await lock.keyPrice()
    await lock.purchase(0, to, constants.ZERO_ADDRESS, [], {
      from,
      value: keyPrice,
    })
  })

  it('hasValidKey should returns a custom value', async () => {
    assert.equal(await lock.getHasValidKey(to), true)
    testEventHooks = await TestEventHooks.new()
    await lock.setEventHooks(
      constants.ZERO_ADDRESS,
      constants.ZERO_ADDRESS,
      testEventHooks.address
    )
    assert.equal(await lock.getHasValidKey(to), false)
  })

  it('cannot set the hook to a non-contract address', async () => {
    await reverts(
      lock.setEventHooks(
        constants.ZERO_ADDRESS,
        constants.ZERO_ADDRESS,
        accounts[3]
      ),
      'INVALID_ON_BALANCEOF_HOOK'
    )
  })
})