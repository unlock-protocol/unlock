const BigNumber = require('bignumber.js')
const { ethers } = require('hardhat')
const { reverts, deployLock } = require('../helpers')

const erc777abi = require('../helpers/ABIs/erc777.json')

let lock

describe('Lock / Lock', (accounts) => {
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
    expirationDuration = new BigNumber(expirationDuration)
    maxNumberOfKeys = new BigNumber(maxNumberOfKeys)
    totalSupply = new BigNumber(totalSupply)
    numberOfOwners = new BigNumber(numberOfOwners)
    assert.equal(expirationDuration.toFixed(), 60 * 60 * 24 * 30)
    assert.strictEqual(
      ethers.utils.formatUnits(ethers.BigNumber.from(keyPrice.toString())),
      '0.01'
    )
    assert.equal(maxNumberOfKeys.toFixed(), 10)
    assert.equal(totalSupply.toFixed(), 0)
    assert.equal(numberOfOwners.toFixed(), 0)
  })

  it('Should fail on unknown calls', async () => {
    const [, recipient] = accounts
    const mock777 = await ethers.getContractAt(erc777abi, lock.address)
    await reverts(mock777.send(recipient, 1, '0x'))
  })
})
