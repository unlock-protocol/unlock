const assert = require('assert')
const { ethers } = require('hardhat')
const { getEvent } = require('@unlock-protocol/hardhat-helpers')

let keyManagerMock
let keyOwner, keyManager, random, notKeyManager
let tokenId
const expirationDuration = BigInt(60 * 60 * 24 * 30)

describe('Permissions / isKeyManager', () => {
  before(async () => {
    ;[, keyOwner, keyManager, random, notKeyManager] = await ethers.getSigners()
    // init template
    const KeyManagerMock = await ethers.getContractFactory('KeyManagerMock')

    keyManagerMock = await KeyManagerMock.deploy()
    const { timestamp } = await ethers.provider.getBlock('latest')
    const timestampBefore = BigInt(timestamp) + expirationDuration

    const tx = await keyManagerMock.createNewKey(
      await keyOwner.getAddress(),
      await keyManager.getAddress(),
      timestampBefore
    )
    const receipt = await tx.wait()
    ;({
      args: { tokenId },
    } = await getEvent(receipt, 'Transfer'))
  })

  describe('confirming the key manager', () => {
    it('should return true if address is the KM', async () => {
      assert.equal(
        await keyManagerMock
          .connect(keyManager)
          .isKeyManager(tokenId, await keyManager.getAddress()),
        true
      )
      // it shouldn't matter who is calling
      assert.equal(
        await keyManagerMock
          .connect(random)
          .isKeyManager(tokenId, await keyManager.getAddress()),
        true
      )
    })
    it('should return false if address is not the KM', async () => {
      assert.equal(
        await keyManagerMock.isKeyManager(
          tokenId,
          await notKeyManager.getAddress()
        ),
        false
      )
    })
  })
})
