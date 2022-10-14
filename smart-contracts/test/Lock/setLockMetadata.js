const metadata = require('../fixtures/metadata')

const { deployLock, reverts } = require('../helpers')

contract('Lock / setLockMetadata', (accounts) => {
  let lock
  let tx

  before(async () => {
    lock = await deployLock({ name: 'NO_MAX_KEYS' })
    tx = await lock.setLockMetadata(...Object.values(metadata), {
      from: accounts[0],
    })
  })

  it('can only be invoked by lock manager', async () => {
    await reverts(
      lock.setLockMetadata(...Object.keys(metadata), {
        from: accounts[5],
      }),
      'ONLY_LOCK_MANAGER'
    )
  })

  it('sets the values correctly', async () => {
    assert.equal(await lock.name(), metadata.name)
    assert.equal(await lock.symbol(), metadata.symbol)
    assert.equal(await lock.tokenURI(0), metadata.baseTokenURI)
  })

  it('emit an event correctly', async () => {
    const { args } = tx.logs.find(({ event }) => event === 'LockMetadata')
    assert.equal(args.name, metadata.name)
    assert.equal(args.symbol, metadata.symbol)
    assert.equal(args.baseTokenURI, metadata.baseTokenURI)
  })
})
