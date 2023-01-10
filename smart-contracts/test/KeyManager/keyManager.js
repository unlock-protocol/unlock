const { expect } = require('chai')
const { ethers, upgrades } = require('hardhat')
const { reverts } = require('../helpers/errors')

contract('KeyManager', () => {
  let unlock
  let publicLock
  let publicLockUpgraded

  beforeEach(async () => {

  })

  it('should be upgradable by the owner only')

  it('should be owned by the owner')

  it('should be transferable by the owner to a new owner')

  it('should not be transferable by someone who is not an owner')

  it('should let the owner change the signer')

  it('should not let someone who is not owner change the signer')

  it('should fail transfers if they have expired')

  it('should fail transfers if they were not signed by the signer')

  it('should lend the key to the sender if the signature matches')


})
