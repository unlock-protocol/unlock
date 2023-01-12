const { deployLock, reverts } = require('../../helpers')
const metadata = require('../../fixtures/metadata')

let unnamedlock
let namedLock

contract('Lock / erc721 / name', (accounts) => {
  before(async () => {
    unnamedlock = await deployLock()
    namedLock = await deployLock({ name: 'NAMED' })
  })

  describe('when no name has been set on creation', () => {
    it('should return the default name when attempting to read the name', async () => {
      assert.equal(await unnamedlock.name(), 'Unlock-Protocol Lock')
    })

    it('should fail if someone other than the owner tries to set the name', async () => {
      await reverts(
        unnamedlock.setLockMetadata(...Object.values(metadata), {
          from: accounts[1],
        }),
        'ONLY_LOCK_MANAGER'
      )
    })

    it('should allow the owner to set a name', async () => {
      await unnamedlock.setLockMetadata(...Object.values(metadata), {
        from: accounts[0],
      })
    })
  })

  describe('when the Lock has a name', () => {
    it('should return return the expected name', async () => {
      assert.equal(await namedLock.name(), 'Custom Named Lock')
    })

    it('should fail if someone other than the owner tries to change the name', async () => {
      await reverts(
        namedLock.setLockMetadata(...Object.values(metadata), {
          from: accounts[1],
        })
      )
    })

    describe('should allow the owner to set a name', () => {
      before(async () => {
        await namedLock.setLockMetadata(...Object.values(metadata), {
          from: accounts[0],
        })
      })

      it('should return return the expected name', async () => {
        assert.equal(await namedLock.name(), metadata.name)
      })
    })

    describe('should allow the owner to unset the name', () => {
      before(async () => {
        await namedLock.setLockMetadata(
          ...Object.values({ ...metadata, name: '' }),
          {
            from: accounts[0],
          }
        )
      })

      it('should return return the expected name', async () => {
        assert.equal(await namedLock.name(), '')
      })
    })
  })
})
