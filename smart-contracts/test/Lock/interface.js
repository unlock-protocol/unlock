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
    // aseert function signature are identical
    const missing = compareInterfaces(lockContract, lockInterface)
    assert.equal(missing.length, 0, `Not in interface:\n${missing.join('\n')}`)

    // assert the function count matches
    assert.equal(
      parseInterface(lockInterface).length,
      parseInterface(lockContract).length
    )
  })
})
