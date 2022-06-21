const unlockContract = artifacts.require('Unlock.sol')

const { reverts, errorMessages } = require('../helpers/errors')
const getContractInstance = require('../helpers/truffle-artifacts')

const { VM_ERROR_REVERT_WITH_REASON } = errorMessages

let unlock

contract('Unlock / initializers', (accounts) => {
  beforeEach(async () => {
    unlock = await getContractInstance(unlockContract)
  })

  it('There is only 1 public initializer in Unlock', async () => {
    const count = unlockContract.abi.filter(
      (x) => x.name.toLowerCase() === 'initialize'
    ).length
    assert.equal(count, 1)
  })

  it('initialize may not be called again', async () => {
    await reverts(
      unlock.initialize(accounts[0]),
      `${VM_ERROR_REVERT_WITH_REASON} 'ALREADY_INITIALIZED'`
    )
  })
})
