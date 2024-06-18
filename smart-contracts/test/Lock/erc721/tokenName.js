const assert = require('assert')
const { ethers } = require('hardhat')
const { deployLock, reverts } = require('../../helpers')
const metadata = require('../../fixtures/metadata')

let unnamedlock
let namedLock
let lockManager, someAccount

describe('Lock / erc721 / name', () => {
  before(async () => {
    ;[lockManager, someAccount] = await ethers.getSigners()

    unnamedlock = await deployLock()
    namedLock = await deployLock({ name: 'NAMED' })
  })

  describe('when no name has been set on creation', () => {
    it('should return the default name when attempting to read the name', async () => {
      assert.equal(await unnamedlock.name(), 'Unlock-Protocol Lock')
    })

    it('should fail if someone other than the owner tries to set the name', async () => {
      await reverts(
        unnamedlock
          .connect(someAccount)
          .setLockMetadata(...Object.values(metadata)),
        'ONLY_LOCK_MANAGER'
      )
    })

    it('should allow the owner to set a name', async () => {
      await unnamedlock
        .connect(lockManager)
        .setLockMetadata(...Object.values(metadata))
    })
  })

  describe('when the Lock has a name', () => {
    it('should return return the expected name', async () => {
      assert.equal(await namedLock.name(), 'Custom Named Lock')
    })

    it('should fail if someone other than the owner tries to change the name', async () => {
      await reverts(
        namedLock
          .connect(someAccount)
          .setLockMetadata(...Object.values(metadata))
      )
    })

    it('should allow the owner to set a name', async () => {
      await namedLock
        .connect(lockManager)
        .setLockMetadata(...Object.values(metadata))
      assert.equal(await namedLock.name(), metadata.name)
    })

    it('should allow the owner to unset the name', async () => {
      await namedLock
        .connect(lockManager)
        .setLockMetadata(...Object.values({ ...metadata, name: '' }))
      assert.equal(await namedLock.name(), '')
    })
  })
})
