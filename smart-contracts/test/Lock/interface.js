const { assert } = require('chai')
const { ethers } = require('hardhat')
const { ADDRESS_ZERO } = require('../helpers')

describe('Lock / interface', () => {
  it('The interface includes all public functions', async () => {
    assert
    const PublicLock = await ethers.getContractFactory('PublicLock')
    const IPublicLock = await ethers.getContractAt('IPublicLock', ADDRESS_ZERO)

    const lockInterface = Object.keys(IPublicLock.interface.functions)
    const lockContract = Object.keys(PublicLock.interface.functions)

    // log any missing entries
    lockContract
      .filter((x) => x.type === 'function')
      .forEach((entry) => {
        if (
          lockInterface.filter((x) => x.name === entry.name).length ===
          lockContract.filter((x) => x.name === entry.name).length
        ) {
          return
        }
        // eslint-disable-next-line no-console
        console.log(entry)
      })

    // and assert the count matches
    const count = lockInterface.length
    const expected = lockContract.length
    assert.notEqual(count, 0)
    assert.equal(count, expected)
  })
})
