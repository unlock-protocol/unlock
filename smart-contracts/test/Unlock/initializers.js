const assert = require('assert')
const { ethers } = require('hardhat')
const { reverts, deployContracts, parseInterface } = require('../helpers')

describe('Unlock / initializers', () => {
  it('There is only 1 public initializer in Unlock', async () => {
    const { interface } = await ethers.getContractFactory('Unlock')
    const count = parseInterface(interface).filter(
      (func) => func === 'function initialize(address)'
    ).length
    assert.equal(count, 1)
  })

  it('initialize may not be called again', async () => {
    const { unlock } = await deployContracts()
    const [, someAccount] = await ethers.getSigners()
    await reverts(
      unlock.initialize(await someAccount.getAddress()),
      'ALREADY_INITIALIZED'
    )
  })
})
