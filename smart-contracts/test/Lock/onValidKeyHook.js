const { reverts } = require('../helpers/errors')
const deployLocks = require('../helpers/deployLocks')
const { ADDRESS_ZERO } = require('../helpers/constants')

const unlockContract = artifacts.require('Unlock.sol')
const TestEventHooks = artifacts.require('TestEventHooks.sol')
const getContractInstance = require('../helpers/truffle-artifacts')

let lock
let locks
let unlock
let tokenId
let testEventHooks

contract('Lock / onValidKeyHook', (accounts) => {
  const from = accounts[1]
  const to = accounts[2]

  before(async () => {
    unlock = await getContractInstance(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
    lock = locks.FIRST
    const keyPrice = await lock.keyPrice()
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
    tokenId = args.tokenId
  })

  it('hasValidKey should returns a custom value', async () => {
    assert.equal(await lock.getHasValidKey(to), true)
    testEventHooks = await TestEventHooks.new()
    await lock.setEventHooks(
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      testEventHooks.address,
      ADDRESS_ZERO,
      ADDRESS_ZERO
    )
    // still returns value
    assert.equal(await lock.getHasValidKey(to), true)

    // expired the key
    await lock.expireAndRefundFor(tokenId, 0)
    assert.equal(await lock.getHasValidKey(to), false)
    assert.equal(await lock.balanceOf(to), 0)

    // set custom value in hook
    await testEventHooks.setSpecialMember(lock.address, to)
    assert.equal(await lock.getHasValidKey(to), true)
  })

  it('cannot set the hook to a non-contract address', async () => {
    await reverts(
      lock.setEventHooks(
        ADDRESS_ZERO,
        ADDRESS_ZERO,
        accounts[3],
        ADDRESS_ZERO,
        ADDRESS_ZERO
      ),
      'INVALID_HOOK(2)'
    )
  })
})
