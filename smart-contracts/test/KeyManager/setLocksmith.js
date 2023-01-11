const { expect } = require('chai')
const { setup } = require('./setup')
const { ethers } = require('hardhat')
const { reverts } = require('../helpers')

let keyManager

contract('KeyManager / setSigner', (accounts) => {

  beforeEach(async () => {
    [keyManager] = await setup(accounts[10])
  })

  it('should let the owner change the signer', async () => {
    expect(await keyManager.locksmith()).to.equal(accounts[10])
    await keyManager.setLocksmith(accounts[1])
    expect(await keyManager.locksmith()).to.equal(accounts[1])
  })

  it('should not let someone who is not owner change the signer', async () => {
    const [, newOwner] = await ethers.getSigners()
    expect(await keyManager.locksmith()).to.equal(accounts[10])

    await reverts(
      keyManager.connect(newOwner).setLocksmith(newOwner.address), `Ownable: caller is not the owner`)

    expect(await keyManager.locksmith()).to.equal(accounts[10])

  })

})
