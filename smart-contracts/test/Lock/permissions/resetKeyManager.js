const BigNumber = require('bignumber.js')
const { constants } = require('hardlydifficult-ethereum-contracts')
const getProxy = require('../../helpers/proxy')

const unlockContract = artifacts.require('Unlock.sol')
const KeyManagerMock = artifacts.require('KeyManagerMock')

let unlock
let lock
let lockCreator
let lockAddress

contract('Permissions / resetKeyManager', accounts => {
  lockCreator = accounts[0]
  let keyManager
  let iD
  const keyPrice = new BigNumber(web3.utils.toWei('0.01', 'ether'))
  const salt = 42

  before(async () => {
    unlock = await getProxy(unlockContract)
    await unlock.setLockTemplate((await KeyManagerMock.new()).address)
    let tx = await unlock.createLock(
      new BigNumber(60 * 60 * 24 * 30), // 30 days
      web3.utils.padLeft(0, 40),
      new BigNumber(web3.utils.toWei('0.01', 'ether')),
      11,
      'KeyManagerMockLock',
      `0x${salt.toString(16)}`,
      { from: lockCreator }
    )
    lockAddress = tx.logs[0].args.newLockAddress
    lock = await KeyManagerMock.at(lockAddress)
    await lock.purchase(0, accounts[1], web3.utils.padLeft(0, 40), [], {
      value: keyPrice.toFixed(),
      from: accounts[1],
    })
  })

  describe('resetting the key manager internally', () => {
    before(async () => {
      iD = await lock.getTokenIdFor(accounts[1])
      await lock.setKeyManagerOf(iD, accounts[9], { from: accounts[1] })
      keyManager = await lock.keyManagerOf.call(iD)
      assert.equal(keyManager, accounts[9])
      await lock.resetKeyManagerOf(iD)
    })

    it('should reset to the default KeyManager of 0x00', async () => {
      keyManager = await lock.keyManagerOf.call(iD)
      assert.equal(keyManager, constants.ZERO_ADDRESS)
    })
  })
})
