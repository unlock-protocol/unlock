const { reverts } = require('truffle-assertions')
const deployLocks = require('../helpers/deployLocks')

const unlockContract = artifacts.require('Unlock.sol')
const getProxy = require('../helpers/proxy')
const { errorMessages } = require('../helpers/constants')

const { VM_ERROR_REVERT_WITH_REASON } = errorMessages

let unlock
let lock
let tokenIds

contract('Lock / transfer', (accounts) => {
  const [lockOwner, singleKeyOwner, multipleKeyOwner, destination] = accounts

  beforeEach(async () => {
    unlock = await getProxy(unlockContract)
    const locks = await deployLocks(unlock, lockOwner)
    lock = locks.OWNED

    const tx = await lock.purchase(
      [],
      [singleKeyOwner, multipleKeyOwner, multipleKeyOwner],
      [
        web3.utils.padLeft(0, 40),
        web3.utils.padLeft(0, 40),
        web3.utils.padLeft(0, 40),
      ],
      [
        web3.utils.padLeft(0, 40),
        web3.utils.padLeft(0, 40),
        web3.utils.padLeft(0, 40),
      ],

      [],
      {
        value: (await lock.keyPrice()) * 3,
        from: singleKeyOwner,
      }
    )

    tokenIds = tx.logs
      .filter((v) => v.event === 'Transfer')
      .map(({ args }) => args.tokenId)
  })

  describe('transfer of single key', () => {
    let originalExpiration

    beforeEach(async () => {
      originalExpiration = await lock.keyExpirationTimestampFor(tokenIds[0])
      await lock.transfer(tokenIds[0], destination, { from: singleKeyOwner })
    })

    it('original owner no longer has a key', async () => {
      const actual = await lock.getHasValidKey(singleKeyOwner)
      assert.equal(actual, false)
    })

    it('new owner has a key', async () => {
      assert.equal(await lock.getHasValidKey(destination), true)
      assert.equal(await lock.ownerOf(tokenIds[0]), destination)
    })

    it('new owner has the entire time remaining (less fees if applicable)', async () => {
      const actual = await lock.keyExpirationTimestampFor(tokenIds[0])
      assert.equal(actual.toString(), originalExpiration.toString())
    })
  })

  describe('transfer of multiple keys', () => {
    beforeEach(async () => {
      await lock.transfer(tokenIds[1], destination, {
        from: multipleKeyOwner,
      })
      await lock.transfer(tokenIds[2], destination, {
        from: multipleKeyOwner,
      })
    })

    it('previous owners has no keys anymore', async () => {
      assert.equal(await lock.balanceOf(multipleKeyOwner), 0)
    })

    it('new owner also has the keys', async () => {
      assert.equal(await lock.ownerOf(tokenIds[1]), destination)
      assert.equal(await lock.ownerOf(tokenIds[2]), destination)
      assert.equal(await lock.balanceOf(destination), 2)
    })
  })

  it('reverts when attempting to transfer to self', async () => {
    await reverts(
      lock.transfer(tokenIds[0], singleKeyOwner, { from: singleKeyOwner }),
      `${VM_ERROR_REVERT_WITH_REASON} 'TRANSFER_TO_SELF'`
    )
  })

  it('fails if key is expired', async () => {
    // Push the clock forward 1 second so that the test failure reason is consistent
    await lock.expireAndRefundFor(tokenIds[0], 0, {
      from: accounts[0],
    })

    await reverts(
      lock.transfer(tokenIds[0], accounts[9], { from: singleKeyOwner }),
      'KEY_NOT_VALID'
    )
  })
})
