const { ethers } = require('hardhat')
const BigNumber = require('bignumber.js')

const unlockContract = artifacts.require('Unlock.sol')
const TimeMachineMock = artifacts.require('TimeMachineMock')
const { reverts } = require('truffle-assertions')
const getProxy = require('../helpers/proxy')
const createLockHash = require('../helpers/createLockCalldata')

let unlock

contract('Lock / timeMachine', (accounts) => {
  let lock
  const lockOwner = accounts[1]
  const keyPrice = new BigNumber(web3.utils.toWei('0.01', 'ether'))
  const keyOwner = accounts[2]
  const expirationDuration = new BigNumber(60 * 60 * 24 * 30)
  const tooMuchTime = new BigNumber(60 * 60 * 24 * 42) // 42 days
  let timestampBefore
  let timestampAfter
  let lockAddress
  let tokenId
  let tx

  before(async () => {
    unlock = await getProxy(unlockContract)
    await unlock.setLockTemplate((await TimeMachineMock.new()).address)

    const args = [
      expirationDuration.toNumber(),
      web3.utils.padLeft(0, 40), // beneficiary
      web3.utils.toWei('0.01', 'ether'),
      11,
      'TimeMachineMockLock',
    ]
    const calldata = await createLockHash({ args, from: lockOwner })
    let tx = await unlock.createUpgradeableLock(calldata)
    lockAddress = tx.logs[0].args.newLockAddress

    lock = await TimeMachineMock.at(lockAddress)
    // Change the fee to 5%
    await lock.updateTransferFee(500, { from: lockOwner })
    await lock.purchase(
      0,
      keyOwner,
      web3.utils.padLeft(0, 40),
      web3.utils.padLeft(0, 40),
      [],
      {
        value: keyPrice.toFixed(),
      }
    )
  })

  describe('modifying the time remaining for a key', () => {
    it('should reduce the time by the amount specified', async () => {
      let hasKey = await lock.getHasValidKey.call(keyOwner)
      assert.equal(hasKey, true)
      timestampBefore = new BigNumber(
        await lock.keyExpirationTimestampFor.call(keyOwner)
      )
      tokenId = await lock.getTokenIdFor(keyOwner)
      await lock.timeMachine(tokenId, 1000, false, {
        from: accounts[0],
      }) // decrease the time with "false"
      timestampAfter = new BigNumber(
        await lock.keyExpirationTimestampFor.call(keyOwner)
      )
      assert(timestampAfter.eq(timestampBefore.minus(1000)))
    })

    it('should increase the time by the amount specified if the key is not expired', async () => {
      timestampBefore = new BigNumber(
        await lock.keyExpirationTimestampFor.call(keyOwner)
      )
      await lock.timeMachine(tokenId, 42, true, {
        from: accounts[0],
      }) // increase the time with "true"
      timestampAfter = new BigNumber(
        await lock.keyExpirationTimestampFor.call(keyOwner)
      )
      assert(timestampAfter.eq(timestampBefore.plus(42)))
    })

    it('should set a new expiration ts from current date/blocktime', async () => {
      // First we substract too much time
      tx = await lock.timeMachine(tokenId, tooMuchTime, false, {
        from: accounts[0],
      })

      // Then we add back some time (the normal duration)
      tx = await lock.timeMachine(tokenId, expirationDuration, true, {
        from: accounts[0],
      })

      const { timestamp: now } = await ethers.provider.getBlock(
        tx.receipt.blockNumber
      )

      timestampAfter = new BigNumber(
        await lock.keyExpirationTimestampFor.call(keyOwner)
      )
      assert(timestampAfter.eq(new BigNumber(now).plus(expirationDuration)))
    })

    it('should emit the ExpirationChanged event', async () => {
      assert.equal(tx.logs[0].event, 'ExpirationChanged')
    })
  })

  describe('failures', async () => {
    it('should not work for a non-existant key', async () => {
      await reverts(
        lock.timeMachine(17, 42, true, { from: accounts[3] }),
        'NON_EXISTENT_KEY'
      )
    })
  })
})
