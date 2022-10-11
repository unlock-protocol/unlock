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
  let unlockContract
  let unlockInterface

  before(async () => {
    ;({ interface: unlockContract } = await ethers.getContractFactory('Unlock'))
    ;({ interface: unlockInterface } = await ethers.getContractAt(
      'IUnlock',
      ADDRESS_ZERO
    ))
  })

  it('The interface includes all public functions', async () => {
    // log any missing entries
    parseFunctions(unlockContract).forEach((entry) => {
      assert(
        parseFunctions(unlockInterface).includes(entry),
        `${entry} not in interface`
      )
    })

    // and assert the count matches
    assert.equal(
      parseFunctions(unlockInterface).length,
      parseFunctions(unlockContract).length
    )
  })
})
