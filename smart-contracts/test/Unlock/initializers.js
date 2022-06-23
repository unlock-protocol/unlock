const Unlock = artifacts.require('Unlock.sol')
const { reverts, deployContracts } = require('../helpers')

contract('Unlock / initializers', (accounts) => {
  it('There is only 1 public initializer in Unlock', async () => {
    const count = Unlock.abi.filter(
      (x) => x.name.toLowerCase() === 'initialize'
    ).length
    assert.equal(count, 1)
  })

  it('initialize may not be called again', async () => {
    const { unlock } = await deployContracts()
    await reverts(unlock.initialize(accounts[0]), 'ALREADY_INITIALIZED')
  })
})
