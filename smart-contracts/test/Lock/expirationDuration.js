const { ethers } = require('hardhat')
const createLockHash = require('../helpers/createLockCalldata')
const { ADDRESS_ZERO, purchaseKey } = require('../helpers')
const deployContracts = require('../fixtures/deploy')
const { assert } = require('chai')

const keyPrice = ethers.utils.parseEther('0.01')

contract('Lock / expirationDuration', () => {
  let lock

  beforeEach(async () => {
    const { unlockEthers: unlock } = await deployContracts()
    const [from] = await ethers.getSigners()

    // create a new lock
    const tokenAddress = ADDRESS_ZERO
    const args = [60 * 30, tokenAddress, keyPrice, 10, 'Test lock']

    const calldata = await createLockHash({ args, from: from.address })
    const tx = await unlock.createUpgradeableLock(calldata)
    const { events } = await tx.wait()
    const {
      args: { newLockAddress },
    } = events.find(({ event }) => event === 'NewLock')

    const PublicLock = await ethers.getContractFactory('PublicLock')
    lock = PublicLock.attach(newLockAddress)
  })

  it('affects newly purchased keys', async () => {
    const [, , buyer, buyer2] = await ethers.getSigners()
    const { tokenId, blockNumber } = await purchaseKey(lock, buyer.address)
    const transfer1Block = await ethers.provider.getBlock(blockNumber)
    assert.equal(
      (await lock.keyExpirationTimestampFor(tokenId)).toNumber(),
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
      buyer2.address
    )
    const transfer2Block = await ethers.provider.getBlock(blockNumber2)

    assert.equal(
      (await lock.keyExpirationTimestampFor(tokenId2)).toNumber(),
      transfer2Block.timestamp + 5000
    )
    assert.equal((await lock.expirationDuration()).toString(), '5000')
  })

  it('does not affect the timestamps of existing keys', async () => {
    const [, , buyer] = await ethers.getSigners()
    await purchaseKey(lock, buyer.address)

    const tsBefore = await lock.keyExpirationTimestampFor(buyer.address)
    await lock.updateLockConfig(
      1000,
      await lock.maxNumberOfKeys(),
      await lock.maxKeysPerAddress()
    )
    const tsAfter = await lock.keyExpirationTimestampFor(buyer.address)

    assert.equal(tsBefore.toString(), tsAfter.toString())
  })
})
