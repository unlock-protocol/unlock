const publicLockContract = artifacts.require('PublicLock')
const {
  reverts,
  ADDRESS_ZERO,
  errorMessages,
  deployLock,
} = require('../helpers')

const { VM_ERROR_REVERT_WITH_REASON } = errorMessages

let lock

contract('Lock / initializers', (accounts) => {
  before(async () => {
    lock = await deployLock()
  })

  it('There are exactly 1 public initializer in PublicLock', async () => {
    const count = publicLockContract.abi.filter((x) =>
      (x.name || '').includes('initialize')
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
