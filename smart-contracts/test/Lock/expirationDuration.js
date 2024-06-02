const { ethers } = require('hardhat')
const {
  createLockCalldata,
  getEvent,
} = require('@unlock-protocol/hardhat-helpers')
const { ADDRESS_ZERO, purchaseKey } = require('../helpers')
const deployContracts = require('../fixtures/deploy')
const assert = require('assert')

const keyPrice = ethers.parseEther('0.01')

describe('Lock / expirationDuration', () => {
  let lock

  beforeEach(async () => {
    const { unlock } = await deployContracts()
    const [from] = await ethers.getSigners()

    // create a new lock
    const tokenAddress = ADDRESS_ZERO
    const args = [60 * 30, tokenAddress, keyPrice, 10, 'Test lock']

    const calldata = await createLockCalldata({
      args,
      from: await from.getAddress(),
    })
    const tx = await unlock.createUpgradeableLock(calldata)
    const receipt = await tx.wait()
    const {
      args: { newLockAddress },
    } = await getEvent(receipt, 'NewLock')

    const PublicLock = await ethers.getContractFactory(
      'contracts/PublicLock.sol:PublicLock'
    )
    lock = PublicLock.attach(newLockAddress)
  })

  it('affects newly purchased keys', async () => {
    const [, , buyer, buyer2] = await ethers.getSigners()
    const { tokenId, blockNumber } = await purchaseKey(
      lock,
      await buyer.getAddress()
    )
    const transfer1Block = await ethers.provider.getBlock(blockNumber)
    assert.equal(
      await lock.keyExpirationTimestampFor(tokenId),
      transfer1Block.timestamp + 1800
    )

    // update duration
    await lock.updateLockConfig(
      5000,
      await lock.maxNumberOfKeys(),
      await lock.maxKeysPerAddress()
    )

    const { tokenId: tokenId2, blockNumber: blockNumber2 } = await purchaseKey(
      lock,
      await buyer2.getAddress()
    )
    const transfer2Block = await ethers.provider.getBlock(blockNumber2)

    assert.equal(
      await lock.keyExpirationTimestampFor(tokenId2),
      transfer2Block.timestamp + 5000
    )
    assert.equal(await lock.expirationDuration(), '5000')
  })

  it('does not affect the timestamps of existing keys', async () => {
    const [, , buyer] = await ethers.getSigners()
    await purchaseKey(lock, await buyer.getAddress())

    const tsBefore = await lock.keyExpirationTimestampFor(
      await buyer.getAddress()
    )
    await lock.updateLockConfig(
      1000,
      await lock.maxNumberOfKeys(),
      await lock.maxKeysPerAddress()
    )
    const tsAfter = await lock.keyExpirationTimestampFor(
      await buyer.getAddress()
    )

    assert.equal(tsBefore, tsAfter)
  })
})
