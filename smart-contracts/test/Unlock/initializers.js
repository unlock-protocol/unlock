const Unlock = artifacts.require('Unlock.sol')

const { reverts, errorMessages, deployContracts } = require('../helpers')

const { VM_ERROR_REVERT_WITH_REASON } = errorMessages

contract('Unlock / initializers', (accounts) => {
  it('There is only 1 public initializer in Unlock', async () => {
    const count = Unlock.abi.filter(
      (x) => x.name.toLowerCase() === 'initialize'
    ).length
    assert.equal(count, 1)
  })

  it('initialize may not be called again', async () => {
    const { unlock } = await deployContracts()
    await reverts(
      unlock.initialize(accounts[0]),
      `${VM_ERROR_REVERT_WITH_REASON} 'ALREADY_INITIALIZED'`
    )
  })
})
