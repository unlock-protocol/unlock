const { ethers } = require('hardhat')
const deployLocks = require('../helpers/deployLocks')

const unlockContract = artifacts.require('Unlock.sol')
const getProxy = require('../helpers/proxy')

contract('LockSerializer', () => {
  let serializer
  let unlock
  let PublicLock
  let beneficiary
  const locks = {}

  beforeEach(async () => {
    unlock = await getProxy(unlockContract)
    ;[, beneficiary] = await ethers.getSigners()

    // deploy serializer
    const LockSerializer = await ethers.getContractFactory('LockSerializer')
    serializer = await LockSerializer.deploy()
    await serializer.deployed()

    // get locks (truffle version)
    const locksTruffle = await deployLocks(unlock, beneficiary.address)

    // parse locks for ethers
    PublicLock = await ethers.getContractFactory('PublicLock')
    Object.keys(locksTruffle).forEach((k) => {
      locks[k] = PublicLock.attach(locksTruffle[k].address)
    })
  })

  describe('serialize', () => {
    it('deserialize values properly', () => {
      Object.keys(locks).forEach(async (id) => {
        const lock = locks[id]
        const serialized = await serializer.serialize(lock.address)

        const propNames = Object.keys(serialized)
          .filter((k) => Number.isNaN(Number.parseInt(k))) // remove numbers from array index
          .filter((k) => !['keyOwners'].includes(k)) // remove arrays
        const values = await Promise.all(propNames.map((k) => lock[k]()))

        // assertions
        propNames.forEach((k, i) => {
          if (
            ethers.BigNumber.isBigNumber(serialized[k]) &&
            ethers.BigNumber.isBigNumber(values[i])
          ) {
            assert.equal(
              serialized[k].eq(values[i]),
              true,
              `different serialized value ${k}, ${serialized[k]}, ${values[i]}`
            )
          } else {
            assert.equal(
              serialized[k],
              values[i],
              `different serialized value ${k}, ${serialized[k]}, ${values[i]}`
            )
          }
        })
      })
    })
    it('fetches all key owners', async () => {
      const [, ...purchasers] = await ethers.getSigners()
      const keyPrice = ethers.utils.parseEther('0.01')

      const lock = locks.FIRST

      const maxNumberOfKeys = await lock.maxNumberOfKeys()

      // purchases
      await Promise.all(
        purchasers
          .slice(0, maxNumberOfKeys.toNumber()) // prevent soldout revert
          .map((purchaser) =>
            lock
              .connect(purchaser)
              .purchase(
                keyPrice.toString(),
                purchaser.address,
                web3.utils.padLeft(0, 40),
                [],
                { value: keyPrice }
              )
          )
      )

      const serialized = await serializer.serialize(lock.address)
      assert.deepEqual(
        serialized.keyOwners,
        purchasers.slice(0, maxNumberOfKeys.toNumber()).map((p) => p.address)
      )
    })
  })
})
