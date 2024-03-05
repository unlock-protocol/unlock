const { assert } = require('chai')
const { ethers } = require('hardhat')
const metadata = require('../fixtures/metadata')

const { deployLock, reverts } = require('../helpers')

describe('Lock / setLockMetadata', () => {
  let lock
  let tx

  before(async () => {
    lock = await deployLock({ name: 'NO_MAX_KEYS' })
    tx = await lock.setLockMetadata(...Object.values(metadata))
  })

  it('can only be invoked by lock manager', async () => {
    const [, , rando] = await ethers.getSigners()
    await reverts(
      lock.connect(rando).setLockMetadata(...Object.values(metadata)),
      'ONLY_LOCK_MANAGER'
    )
  })

  it('sets the values correctly', async () => {
    assert.equal(await lock.name(), metadata.name)
    assert.equal(await lock.symbol(), metadata.symbol)
    assert.equal(await lock.tokenURI(0), metadata.baseTokenURI)
  })

  it('emit an event correctly', async () => {
    const { events } = await tx.wait()
    const { args } = events.find(({ event }) => event === 'LockMetadata')
    assert.equal(args.name, metadata.name)
    assert.equal(args.symbol, metadata.symbol)
    assert.equal(args.baseTokenURI, metadata.baseTokenURI)
  })
})
