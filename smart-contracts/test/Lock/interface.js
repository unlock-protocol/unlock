const { assert } = require('chai')
const { ethers } = require('hardhat')
const {
  ADDRESS_ZERO,
  parseInterface,
  compareInterfaces,
} = require('../helpers')

contract('Lock / interface', () => {
  let lockContract
  let lockInterface

  before(async () => {
    ;({ interface: lockContract } = await ethers.getContractFactory(
      'PublicLock'
    ))
    ;({ interface: lockInterface } = await ethers.getContractAt(
      'IPublicLock',
      ADDRESS_ZERO
    ))
  })

  it('The interface includes all public functions', async () => {
    // assert function signatures are identical
    const missing = compareInterfaces(lockContract, lockInterface)
    const remaining = compareInterfaces(lockInterface, lockContract)

    assert.equal(
      missing.length + remaining.length,
      0,
      `\n${missing.length + remaining.length} errors.
---
${missing.length ? `Missing in interface:\n${missing.join('\n')}` : ''}.
---
${remaining.length ? `Missing in contract:\n${remaining.join('\n')}` : ''}`
    )

    // assert the function count matches
    assert.equal(
      parseInterface(lockInterface).length,
      parseInterface(lockContract).length
    )
  })
})
