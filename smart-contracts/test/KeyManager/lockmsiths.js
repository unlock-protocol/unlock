const { expect } = require('chai')
const { setup } = require('./setup')
const { ethers } = require('hardhat')
const { reverts } = require('../helpers')

let keyManager

contract('KeyManager / locksmiths', (accounts) => {

  beforeEach(async () => {
    [keyManager] = await setup()
  })

  it('should let the owner add signer', async () => {
    expect(await keyManager.locksmiths(accounts[1])).to.equal(false)
    await keyManager.addLocksmith(accounts[1])
    expect(await keyManager.locksmiths(accounts[1])).to.equal(true)
  })

  it('should not let someone who is not owner add a signer', async () => {
    const [, newOwner] = await ethers.getSigners()
    expect(await keyManager.locksmiths(accounts[1])).to.equal(false)

    await reverts(
      keyManager.connect(newOwner).addLocksmith(newOwner.address), `Ownable: caller is not the owner`)

    expect(await keyManager.locksmiths(accounts[1])).to.equal(false)
  })

  it('should let the owner remove signer', async () => {
    await keyManager.addLocksmith(accounts[1])
    expect(await keyManager.locksmiths(accounts[1])).to.equal(true)
    await keyManager.removeLocksmith(accounts[1])
    expect(await keyManager.locksmiths(accounts[1])).to.equal(false)
  })

  it('should not let someone who is not owner remove a signer', async () => {
    await keyManager.addLocksmith(accounts[1])
    expect(await keyManager.locksmiths(accounts[1])).to.equal(true)

    const [, newOwner] = await ethers.getSigners()
    await reverts(
      keyManager.connect(newOwner).removeLocksmith(newOwner.address), `Ownable: caller is not the owner`)

    expect(await keyManager.locksmiths(accounts[1])).to.equal(true)
  })

})
