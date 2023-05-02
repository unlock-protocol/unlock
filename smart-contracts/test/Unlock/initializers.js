const { ethers } = require('hardhat')
const { reverts, deployContracts, parseInterface } = require('../helpers')

contract('Unlock / initializers', (accounts) => {
  it('There is only 1 public initializer in Unlock', async () => {
    const { interface } = await ethers.getContractFactory('Unlock')
    const count = parseInterface(interface).filter(
      (func) => func === 'function initialize(address)'
    ).length
    assert.equal(count, 1)
  })

  it('initialize may not be called again', async () => {
    const { unlock } = await deployContracts()
    await reverts(unlock.initialize(accounts[0]), 'ALREADY_INITIALIZED')
  })
})
