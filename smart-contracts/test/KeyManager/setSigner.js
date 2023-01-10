const { expect } = require('chai')
const { ethers } = require('hardhat')
const { setup } = require('./setup')

let lock
let keyManager

contract('KeyManager', (accounts) => {

  beforeEach(async () => {
    [keyManager, lock] = await setup(accounts)
  })

  it('should let the owner change the signer')

  it('should not let someone who is not owner change the signer')

})
