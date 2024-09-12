const assert = require('assert')
const { setup } = require('./setup')
const { ethers } = require('hardhat')
const { reverts } = require('../helpers')

let keyManager, someAccount

describe('KeyManager / locksmiths', () => {
  beforeEach(async () => {
    ;[, , , { address: someAccount }] = await ethers.getSigners()
    ;[keyManager] = await setup()
  })

  it('should let the owner add signer', async () => {
    assert.equal(await keyManager.locksmiths(someAccount), false)
    await keyManager.addLocksmith(someAccount)
    assert.equal(await keyManager.locksmiths(someAccount), true)
  })

  it('should not let someone who is not owner add a signer', async () => {
    const [, newOwner] = await ethers.getSigners()
    assert.equal(await keyManager.locksmiths(someAccount), false)

    await reverts(
      keyManager.connect(newOwner).addLocksmith(await newOwner.getAddress()),
      `Ownable: caller is not the owner`
    )

    assert.equal(await keyManager.locksmiths(someAccount), false)
  })

  it('should let the owner remove signer', async () => {
    await keyManager.addLocksmith(someAccount)
    assert.equal(await keyManager.locksmiths(someAccount), true)
    await keyManager.removeLocksmith(someAccount)
    assert.equal(await keyManager.locksmiths(someAccount), false)
  })

  it('should not let someone who is not owner remove a signer', async () => {
    await keyManager.addLocksmith(someAccount)
    assert.equal(await keyManager.locksmiths(someAccount), true)

    const [, newOwner] = await ethers.getSigners()
    await reverts(
      keyManager.connect(newOwner).removeLocksmith(await newOwner.getAddress()),
      `Ownable: caller is not the owner`
    )

    assert.equal(await keyManager.locksmiths(someAccount), true)
  })
})
