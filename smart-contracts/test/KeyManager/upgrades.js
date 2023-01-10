const { expect } = require('chai')
const { ethers } = require('hardhat')
const { setup } = require('./setup')

let lock
let keyManager

contract('KeyManager', (accounts) => {

  beforeEach(async () => {
    [keyManager, lock] = await setup(accounts)
  })

  it('should be upgradable by the owner only')

})
