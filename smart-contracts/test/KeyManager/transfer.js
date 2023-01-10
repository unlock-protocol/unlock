const { expect } = require('chai')
const { ethers } = require('hardhat')
const { setup } = require('./setup')

let lock
let keyManager

contract('KeyManager', (accounts) => {

  beforeEach(async () => {
    [keyManager, lock] = await setup(accounts)
  })

  it('should fail transfers if they have expired')

  it('should fail transfers if they were not signed by the signer')

  it('should lend the key to the sender if the signature matches')

})
