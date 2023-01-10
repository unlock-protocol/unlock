const { expect } = require('chai')
const { ethers } = require('hardhat')
const { setup } = require('./setup')

let lock
let keyManager

contract('KeyManager', (accounts) => {

  beforeEach(async () => {
    [keyManager, lock] = await setup(accounts)
  })


  it('should be owned by the owner')

  it('should be transferable by the owner to a new owner')

  it('should not be transferable by someone who is not an owner')


})
