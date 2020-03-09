const BigNumber = require('bignumber.js')
const truffleAssert = require('truffle-assertions')

const deployLocks = require('../helpers/deployLocks')

const unlockContract = artifacts.require('Unlock.sol')
const getProxy = require('../helpers/proxy')

let unlock
let locks

contract('Lock / invalidateOffchainApproval', accounts => {
  let lock
  const keyOwner = accounts[1]

  beforeEach(async () => {
    unlock = await getProxy(unlockContract)
    locks = await deployLocks(unlock, accounts[0])

    lock = locks.SECOND
  })

  it('can read the current nonce', async () => {
    const nonce = new BigNumber(await lock.keyManagerToNonce.call(keyOwner))
    assert.equal(nonce.toFixed(), 0)
  })

  describe('increment nonce', () => {
    beforeEach(async () => {
      await lock.invalidateOffchainApproval('1', { from: keyOwner })
    })

    it('can read the current nonce', async () => {
      const nonce = new BigNumber(await lock.keyManagerToNonce.call(keyOwner))
      assert.equal(nonce.toFixed(), '1')
    })
  })

  describe('assign high nonce', () => {
    const nonce = '999999999999999999999'
    beforeEach(async () => {
      await lock.invalidateOffchainApproval(nonce, { from: keyOwner })
    })

    it('can read the current nonce', async () => {
      const nonce = new BigNumber(await lock.keyManagerToNonce.call(keyOwner))
      assert.equal(nonce.toFixed(), nonce)
    })

    it('shouldFail to reduce the nonce', async () => {
      await truffleAssert.fails(
        lock.invalidateOffchainApproval('1', { from: keyOwner }),
        'revert',
        'NONCE_ALREADY_USED'
      )
    })
  })
})
