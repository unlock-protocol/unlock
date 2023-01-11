const { expect } = require('chai')
const { ethers } = require('hardhat')
const { setup } = require('./setup')
const { reverts } = require('../helpers')

let keyManager

contract('KeyManager / Ownable', (accounts) => {

  beforeEach(async () => {
    [keyManager] = await setup(accounts[10])
  })


  it('should be owned by the owner', async () => {
    const owner = await keyManager.owner()
    expect(owner).to.equal(accounts[0])
  })

  it('should be transferable by the owner to a new owner', async () => {
    await keyManager.transferOwnership(accounts[1])
    expect(await keyManager.owner()).to.equal(accounts[1])
  })

  it('should not be transferable by someone who is not an owner', async () => {
    const [, newOwner] = await ethers.getSigners()
    expect(await keyManager.owner()).to.equal(accounts[0])

    await reverts(
      keyManager.connect(newOwner).transferOwnership(newOwner.address), `Ownable: caller is not the owner`)

    expect(await keyManager.owner()).to.equal(accounts[0])
  })


})
