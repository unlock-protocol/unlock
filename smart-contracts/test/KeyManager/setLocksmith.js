const { expect } = require('chai')
const { ADDRESS_ZERO } = require('../helpers')
const { setup } = require('./setup')
const { ethers } = require('hardhat')
const { reverts } = require('../helpers')

let keyManager

contract('KeyManager / setSigner', (accounts) => {

  beforeEach(async () => {
    [keyManager] = await setup(accounts)
  })

  it('should let the owner change the signer', async () => {
    expect(await keyManager.locksmith()).to.equal(ADDRESS_ZERO)
    await keyManager.setLocksmith(accounts[1])
    expect(await keyManager.locksmith()).to.equal(accounts[1])
  })

  it('should not let someone who is not owner change the signer', async () => {
    const [, newOwner] = await ethers.getSigners()
    expect(await keyManager.locksmith()).to.equal(ADDRESS_ZERO)

    await reverts(
      keyManager.connect(newOwner).setLocksmith(newOwner.address), `Ownable: caller is not the owner`)

    expect(await keyManager.locksmith()).to.equal(ADDRESS_ZERO)

  })

})
