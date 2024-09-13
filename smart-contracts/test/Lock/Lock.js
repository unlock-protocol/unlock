const assert = require('assert')
const { ethers } = require('hardhat')
const { reverts, deployLock, compareBigNumbers } = require('../helpers')

const erc777abi = require('@unlock-protocol/hardhat-helpers/dist/ABIs/erc777.json')

let lock

describe('Lock / Lock', () => {
  before(async () => {
    lock = await deployLock()
  })

  it('should have created locks with the correct value', async () => {
    let [
      expirationDuration,
      keyPrice,
      maxNumberOfKeys,
      totalSupply,
      numberOfOwners,
    ] = await Promise.all([
      lock.expirationDuration(),
      lock.keyPrice(),
      lock.maxNumberOfKeys(),
      lock.totalSupply(),
      lock.numberOfOwners(),
    ])
    compareBigNumbers(expirationDuration, 60 * 60 * 24 * 30)
    assert.strictEqual(ethers.formatUnits(keyPrice), '0.01')
    compareBigNumbers(maxNumberOfKeys, 10)
    compareBigNumbers(totalSupply, 0)
    compareBigNumbers(numberOfOwners, 0)
  })

  it('Should fail on unknown calls', async () => {
    const [, recipient] = await ethers.getSigners()
    const mock777 = await ethers.getContractAt(
      erc777abi,
      await lock.getAddress()
    )
    await reverts(mock777.send(await recipient.getAddress(), 1, '0x'))
  })
})
