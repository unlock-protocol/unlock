const { assert } = require('chai')
const { ethers } = require('hardhat')
const {
  ADDRESS_ZERO,
  parseInterface,
  compareInterfaces,
} = require('../helpers')

contract('Unlock / interface', () => {
  let unlockContract
  let unlockInterface

  before(async () => {
    ;({ interface: unlockContract } = await ethers.getContractFactory(
      'contracts/interfaces/Unlock.sol:Unlock'
    ))
    ;({ interface: unlockInterface } = await ethers.getContractAt(
      'contracts/interfaces/IUnlock.sol:IUnlock',
      ADDRESS_ZERO
    ))
  })

  it('The interface includes all public functions', async () => {
    // assert function signatures are identical
    const missing = compareInterfaces(unlockContract, unlockInterface)
    assert.equal(missing.length, 0, `Not in interface:\n${missing.join('\n')}`)

    // assert the function count matches
    assert.equal(
      parseInterface(unlockInterface).length,
      parseInterface(unlockContract).length
    )
  })
})
