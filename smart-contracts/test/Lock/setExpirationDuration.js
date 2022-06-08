const { ethers } = require('hardhat')
const createLockHash = require('../helpers/createLockCalldata')
const { ADDRESS_ZERO } = require('../helpers/constants')
const deployContracts = require('../fixtures/deploy')

const keyPrice = ethers.utils.parseEther('0.01')

contract('Lock / setExpirationDuration', () => {
  let lock

  beforeEach(async () => {
    const { unlock } = await deployContracts()
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
    const tx = await lock
      .connect(buyer)
      .purchase(
        [keyPrice.toString()],
        [buyer.address],
        [ADDRESS_ZERO],
        [ADDRESS_ZERO],
        [[]],
        {
          value: keyPrice.toString(),
        }
      )
    await tx.wait()
    const { events, blockNumber } = await tx.wait()
    const transfer1Block = await ethers.provider.getBlock(blockNumber)
    const {
      args: { tokenId },
    } = events.find((v) => v.event === 'Transfer')
    expect(
      (await lock.keyExpirationTimestampFor(tokenId)).toNumber()
    ).to.be.equals(transfer1Block.timestamp + 1800)

    // update duration
    await lock.setExpirationDuration(5000)
    const tx2 = await lock
      .connect(buyer2)
      .purchase(
        [keyPrice.toString()],
        [buyer2.address],
        [ADDRESS_ZERO],
        [ADDRESS_ZERO],
        [[]],
        {
          value: keyPrice.toString(),
        }
      )
    const receipt2 = await tx2.wait()
    const transfer2Block = await ethers.provider.getBlock(receipt2.blockNumber)
    const {
      args: { tokenId: newTokenId },
    } = receipt2.events.find((v) => v.event === 'Transfer')

    expect(
      (await lock.keyExpirationTimestampFor(newTokenId)).toNumber()
    ).to.be.equals(transfer2Block.timestamp + 5000)
    expect((await lock.expirationDuration()).toString()).to.be.equal('5000')
  })

  it('does not affect the timestamps of existing keys', async () => {
    const [, , buyer] = await ethers.getSigners()
    const tx = await lock
      .connect(buyer)
      .purchase(
        [keyPrice.toString()],
        [buyer.address],
        [ADDRESS_ZERO],
        [ADDRESS_ZERO],
        [[]],
        {
          value: keyPrice.toString(),
        }
      )
    await tx.wait()

    const tsBefore = await lock.keyExpirationTimestampFor(buyer.address)
    await lock.setExpirationDuration(1000)
    const tsAfter = await lock.keyExpirationTimestampFor(buyer.address)

    expect(tsBefore.toString()).to.be.equal(tsAfter.toString())
  })
})
