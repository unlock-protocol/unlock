const { ethers } = require('hardhat')
const createLockHash = require('../helpers/createLockCalldata')
const { ADDRESS_ZERO, purchaseKey } = require('../helpers')
const deployContracts = require('../fixtures/deploy')

const keyPrice = ethers.utils.parseEther('0.01')

contract('Lock / setExpirationDuration', () => {
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

  it('update the expiration duration of an existing lock', async () => {
    expect((await lock.expirationDuration()).toString()).to.be.equal('1800')

    await lock.setExpirationDuration(1000)
    expect((await lock.expirationDuration()).toString()).to.be.equal('1000')
  })

  it('affects newly purchased keys', async () => {
    const [, , buyer, buyer2] = await ethers.getSigners()
    const { tokenId, blockNumber } = await purchaseKey(lock, buyer.address)
    const transfer1Block = await ethers.provider.getBlock(blockNumber)
    expect(
      (await lock.keyExpirationTimestampFor(tokenId)).toNumber()
    ).to.be.equals(transfer1Block.timestamp + 1800)

    // update duration
    await lock.setExpirationDuration(5000)
    const { tokenId: tokenId2, blockNumber: blockNumber2 } = await purchaseKey(
      lock,
      buyer2.address
    )
    const transfer2Block = await ethers.provider.getBlock(blockNumber2)

    expect(
      (await lock.keyExpirationTimestampFor(tokenId2)).toNumber()
    ).to.be.equals(transfer2Block.timestamp + 5000)
    expect((await lock.expirationDuration()).toString()).to.be.equal('5000')
  })

  it('does not affect the timestamps of existing keys', async () => {
    const [, , buyer] = await ethers.getSigners()
    await purchaseKey(lock, buyer.address)

    const tsBefore = await lock.keyExpirationTimestampFor(buyer.address)
    await lock.setExpirationDuration(1000)
    const tsAfter = await lock.keyExpirationTimestampFor(buyer.address)

    expect(tsBefore.toString()).to.be.equal(tsAfter.toString())
  })
})
