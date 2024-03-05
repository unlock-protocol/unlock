const { assert } = require('chai')
const { ethers } = require('hardhat')

let keyManagerMock
let keyOwner, keyManager, random, notKeyManager
let tokenId
const expirationDuration = ethers.BigNumber.from(60 * 60 * 24 * 30)

describe('Permissions / isKeyManager', () => {
  before(async () => {
    ;[, keyOwner, keyManager, random, notKeyManager] = await ethers.getSigners()
    // init template
    const KeyManagerMock = await ethers.getContractFactory('KeyManagerMock')

    keyManagerMock = await KeyManagerMock.deploy()
    const { timestamp } = await ethers.provider.getBlock('latest')
    const timestampBefore =
      ethers.BigNumber.from(timestamp).add(expirationDuration)

    const tx = await keyManagerMock.createNewKey(
      keyOwner.address,
      keyManager.address,
      timestampBefore
    )
    const { events } = await tx.wait()
    ;({
      args: { tokenId },
    } = events.find((v) => v.event === 'Transfer'))
  })

  describe('confirming the key manager', () => {
    it('should return true if address is the KM', async () => {
      assert.equal(
        await keyManagerMock
          .connect(keyManager)
          .isKeyManager(tokenId, keyManager.address),
        true
      )
      // it shouldn't matter who is calling
      assert.equal(
        await keyManagerMock
          .connect(random)
          .isKeyManager(tokenId, keyManager.address),
        true
      )
    })
    it('should return false if address is not the KM', async () => {
      assert.equal(
        await keyManagerMock.isKeyManager(tokenId, notKeyManager.address),
        false
      )
    })
  })
})
