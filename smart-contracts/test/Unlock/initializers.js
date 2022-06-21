const unlockContract = artifacts.require('Unlock.sol')

const { reverts } = require('../helpers/errors')
const getContractInstance = require('../helpers/truffle-artifacts')
const { errorMessages } = require('../helpers/constants')

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
    await reverts(unlock.initialize(accounts[0]), 'ALREADY_INITIALIZED')
  })
})
