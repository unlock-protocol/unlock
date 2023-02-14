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
      'contracts/Unlock.sol:Unlock'
    ))
    ;({ interface: unlockInterface } = await ethers.getContractAt(
      'contracts/interfaces/IUnlock.sol:IUnlock',
      ADDRESS_ZERO
    ))
  })

  it('The interface includes all public functions', async () => {
    // assert function signatures are identical
    const missing = compareInterfaces(unlockContract, unlockInterface)
    const remaining = compareInterfaces(unlockInterface, unlockContract)

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
      parseInterface(unlockInterface).length,
      parseInterface(unlockContract).length
    )
  })
})
