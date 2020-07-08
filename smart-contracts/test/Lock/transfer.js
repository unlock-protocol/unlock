const { constants } = require('hardlydifficult-eth')
const { reverts } = require('truffle-assertions')
const deployLocks = require('../helpers/deployLocks')

const unlockContract = artifacts.require('Unlock.sol')
const getProxy = require('../helpers/proxy')

let unlock
let lock

contract('Lock / transfer', accounts => {
  const [lockOwner, singleKeyOwner, multipleKeyOwner, destination] = accounts

  beforeEach(async () => {
    unlock = await getProxy(unlockContract)
    const locks = await deployLocks(unlock, lockOwner)
    lock = locks.OWNED

    await lock.purchase(0, singleKeyOwner, web3.utils.padLeft(0, 40), [], {
      value: await lock.keyPrice(),
      from: singleKeyOwner,
    })

    for (let i = 0; i < 2; i++) {
      await lock.purchase(0, multipleKeyOwner, web3.utils.padLeft(0, 40), [], {
        value: await lock.keyPrice(),
        from: multipleKeyOwner,
      })
    }
  })

  describe('full transfer of single key', () => {
    let originalExpiration

    beforeEach(async () => {
      originalExpiration = await lock.keyExpirationTimestampFor(singleKeyOwner)
      await lock.transfer(destination, 1, { from: singleKeyOwner })
    })

    it('original owner no longer has a key', async () => {
      const actual = await lock.getHasValidKey(singleKeyOwner)
      assert.equal(actual, false)
    })

    it('new owner has a key', async () => {
      const actual = await lock.getHasValidKey(destination)
      assert.equal(actual, true)
    })

    it('new owner has the entire time remaining (less fees if applicable)', async () => {
      const actual = await lock.keyExpirationTimestampFor(destination)
      assert.equal(actual.toString(), originalExpiration.toString())
    })

    it('fails if no time remains', async () => {
      await reverts(
        lock.transfer(destination, 1, { from: singleKeyOwner }),
        'KEY_NOT_VALID'
      )
    })
  })

  describe('full transfer of multiple keys', () => {
    let originalExpiration

    beforeEach(async () => {
      originalExpiration = await lock.keyExpirationTimestampFor(
        multipleKeyOwner
      )
      await lock.transfer(destination, constants.MAX_UINT, {
        from: multipleKeyOwner,
      })
    })

    it('original owner no longer has a key', async () => {
      const actual = await lock.getHasValidKey(multipleKeyOwner)
      assert.equal(actual, false)
    })

    it('new owner has a key', async () => {
      const actual = await lock.getHasValidKey(destination)
      assert.equal(actual, true)
    })

    it('new owner has the entire time remaining (less fees if applicable)', async () => {
      const actual = await lock.keyExpirationTimestampFor(destination)
      assert.equal(actual.toString(), originalExpiration.toString())
    })
  })

  describe('partial transfer of multiple keys', () => {
    beforeEach(async () => {
      await lock.transfer(destination, 1, {
        from: multipleKeyOwner,
      })
    })

    it('original owner still longer has a key', async () => {
      const actual = await lock.getHasValidKey(multipleKeyOwner)
      assert.equal(actual, true)
    })

    it('new owner also has a key', async () => {
      const actual = await lock.getHasValidKey(destination)
      assert.equal(actual, true)
    })
  })
})
