const unlockContract = artifacts.require('Unlock.sol')
const publicLockContract = artifacts.require('PublicLock')

const { reverts } = require('truffle-assertions')
const { constants } = require('hardlydifficult-ethereum-contracts')
const getProxy = require('../helpers/proxy')
const deployLocks = require('../helpers/deployLocks')
const { errorMessages } = require('../helpers/constants')

const { VM_ERROR_REVERT_WITH_REASON } = errorMessages

let unlock
let lock

contract('Lock / initializers', (accounts) => {
  beforeEach(async () => {
    unlock = await getProxy(unlockContract)
    const locks = await deployLocks(unlock, accounts[0])
    lock = locks.FIRST
  })

  it('There are exactly 2 public initializers in PublicLock', async () => {
    const count = publicLockContract.abi.filter((x) =>
      (x.name || '').toLowerCase().includes('initialize')
    ).length
    assert.equal(count, 2)
  })

  it('initialize() may not be called again', async () => {
    await reverts(
      lock.initialize(),
      `${VM_ERROR_REVERT_WITH_REASON} 'Contract instance has already been initialized'`
    )
  })

  it('initialize(lock settings..) may not be called again', async () => {
    await reverts(
      lock.initialize(accounts[0], 0, constants.ZERO_ADDRESS, 0, 0, ''),
      `${VM_ERROR_REVERT_WITH_REASON} 'Contract instance has already been initialized'`
    )
  })
})
