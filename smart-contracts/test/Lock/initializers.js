const unlockContract = artifacts.require('Unlock.sol')
const publicLockContract = artifacts.require('PublicLock')

const { reverts } = require('../helpers/errors')
const getContractInstance = require('../helpers/truffle-artifacts')
const deployLocks = require('../helpers/deployLocks')
const { ADDRESS_ZERO, errorMessages } = require('../helpers/constants')

const { VM_ERROR_REVERT_WITH_REASON } = errorMessages

let unlock
let lock

contract('Lock / initializers', (accounts) => {
  beforeEach(async () => {
    unlock = await getContractInstance(unlockContract)
    const locks = await deployLocks(unlock, accounts[0])
    lock = locks.FIRST
  })

  it('There are exactly 1 public initializer in PublicLock', async () => {
    const count = publicLockContract.abi.filter((x) =>
      (x.name || '').toLowerCase().includes('initialize')
    ).length
    assert.equal(count, 1)
  })

  it('initialize() may not be called again', async () => {
    await reverts(
      lock.initialize(accounts[0], 0, ADDRESS_ZERO, 0, 0, ''),
      `${VM_ERROR_REVERT_WITH_REASON} 'Initializable: contract is already initialized'`
    )
  })
})
