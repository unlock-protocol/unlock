const assert = require('assert')
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
    assert.equal(owner, await firstAccount.getAddress())
  })

  it('should be transferable by the owner to a new owner', async () => {
    await keyManager.transferOwnership(await keyReceiver.getAddress())
    assert.equal(await keyManager.owner(), await keyReceiver.getAddress())
  })

  it('should not be transferable by someone who is not an owner', async () => {
    const [, newOwner] = await ethers.getSigners()
    assert.equal(await keyManager.owner(), await firstAccount.getAddress())

    await reverts(
      keyManager
        .connect(newOwner)
        .transferOwnership(await newOwner.getAddress()),
      `Ownable: caller is not the owner`
    )

    assert.equal(await keyManager.owner(), await firstAccount.getAddress())
  })
})
