const { assert } = require('chai')
const { ethers } = require('hardhat')
const { ADDRESS_ZERO } = require('../helpers')

const parseFunctions = ({ functions }) => {
  const iface = new ethers.utils.Interface(Object.values(functions))
  return iface
    .format(ethers.utils.FormatTypes.minimal)
    .map((d) => d.split('@')[0].trim())
}

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
    // log any missing entries
    parseFunctions(lockContract).forEach((entry) => {
      assert(
        parseFunctions(lockInterface).includes(entry),
        `${entry} not in interface`
      )
    })

    // and assert the count matches
    assert.equal(
      parseFunctions(lockInterface).length,
      parseFunctions(lockContract).length
    )
  })
})
