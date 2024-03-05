const { expect } = require('chai')
const { ethers } = require('hardhat')
const { setup } = require('./setup')
const { reverts } = require('../helpers')

let keyManager, keyReceiver, firstAccount

describe('KeyManager / Ownable', () => {
  beforeEach(async () => {
    ;[firstAccount, keyReceiver] = await ethers.getSigners()
    ;[keyManager] = await setup()
  })

  it('should be owned by the owner', async () => {
    const owner = await keyManager.owner()
    expect(owner).to.equal(firstAccount.address)
  })

  it('should be transferable by the owner to a new owner', async () => {
    await keyManager.transferOwnership(keyReceiver.address)
    expect(await keyManager.owner()).to.equal(keyReceiver.address)
  })

  it('should not be transferable by someone who is not an owner', async () => {
    const [, newOwner] = await ethers.getSigners()
    expect(await keyManager.owner()).to.equal(firstAccount.address)

    await reverts(
      keyManager.connect(newOwner).transferOwnership(newOwner.address),
      `Ownable: caller is not the owner`
    )

    expect(await keyManager.owner()).to.equal(firstAccount.address)
  })
})
