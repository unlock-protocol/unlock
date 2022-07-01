const { ethers } = require('hardhat')
const { reverts, ADDRESS_ZERO, deployLock } = require('../helpers')

describe('Lock / initializers', (accounts) => {
  it('There are exactly 1 public initializer in PublicLock', async () => {
    const { interface } = await ethers.getContractFactory('PublicLock')
    const count = interface.filter((x) =>
      (x.name || '').includes('initialize')
    ).length
    assert.equal(count, 1)
  })

  it('initialize() may not be called again', async () => {
    const lock = await deployLock()
    await reverts(
      lock.initialize(accounts[0], 0, ADDRESS_ZERO, 0, 0, ''),
      'Initializable: contract is already initialized'
    )
  })
})
