const { expect } = require('chai')
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
    expect(await keyManager.locksmiths(someAccount)).to.equal(false)
    await keyManager.addLocksmith(someAccount)
    expect(await keyManager.locksmiths(someAccount)).to.equal(true)
  })

  it('should not let someone who is not owner add a signer', async () => {
    const [, newOwner] = await ethers.getSigners()
    expect(await keyManager.locksmiths(someAccount)).to.equal(false)

    await reverts(
      keyManager.connect(newOwner).addLocksmith(newOwner.address),
      `Ownable: caller is not the owner`
    )

    expect(await keyManager.locksmiths(someAccount)).to.equal(false)
  })

  it('should let the owner remove signer', async () => {
    await keyManager.addLocksmith(someAccount)
    expect(await keyManager.locksmiths(someAccount)).to.equal(true)
    await keyManager.removeLocksmith(someAccount)
    expect(await keyManager.locksmiths(someAccount)).to.equal(false)
  })

  it('should not let someone who is not owner remove a signer', async () => {
    await keyManager.addLocksmith(someAccount)
    expect(await keyManager.locksmiths(someAccount)).to.equal(true)

    const [, newOwner] = await ethers.getSigners()
    await reverts(
      keyManager.connect(newOwner).removeLocksmith(newOwner.address),
      `Ownable: caller is not the owner`
    )

    expect(await keyManager.locksmiths(someAccount)).to.equal(true)
  })
})
