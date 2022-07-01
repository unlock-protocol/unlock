const { ethers } = require('hardhat')

const PublicLock = artifacts.require('PublicLock')
const { ADDRESS_ZERO, deployContracts } = require('../helpers')

let unlock
let lock
let publicLockUpgraded

describe('Unlock / createLock (Legacy)', (accounts) => {
  before(async () => {
    ;({ unlock } = await deployContracts())

    // deploy new implementation
    const PublicLockUpgraded = await ethers.getContractFactory(
      'TestPublicLockUpgraded'
    )
    publicLockUpgraded = await PublicLockUpgraded.deploy()
    await publicLockUpgraded.deployed()
  })

  describe('Deploy correctly using legacy createLock method', () => {
    const testSalts = [
      '0x000000000000000000000000',
      '0x000000000000000000000001',
      '0x000000000000000000000002',
      // '0xffffffffffffffffffffffff',
      // '0xefffffffffffffffffffffff',
      // '0xdfffffffffffffffffffffff',
      // '0x0000000000f0000000000000',
      // '0x0000000000e0000000000000',
    ]
    for (let i = 0; i < testSalts.length; i++) {
      const salt = testSalts[i]
      let args

      describe(`Salt: ${salt}`, () => {
        before(async () => {
          args = [
            60 * 60 * 24 * 30, // expirationDuration: 30 days
            ADDRESS_ZERO,
            ethers.utils.parseUnits('1', 'ether'), // keyPrice: in wei
            100, // maxNumberOfKeys
            'Test Lock',
          ]
          let tx = await unlock.createLock(...args, salt, {
            from: accounts[0],
          })
          const evt = tx.logs.find((v) => v.event === 'NewLock')
          lock = await PublicLock.at(evt.args.newLockAddress)
        })

        it('Can read from the lock', async () => {
          const result = await lock.expirationDuration()
          assert.equal(result, args[0])
          assert.equal(await lock.tokenAddress(), args[1])
          assert.equal((await lock.keyPrice()).toString(), args[2].toString())
          assert.equal(await lock.maxNumberOfKeys(), args[3])
          assert.equal(await lock.name(), args[4])
        })

        it('lock is upgradeable', async () => {
          const currentVersion = await lock.publicLockVersion()
          await unlock.addLockTemplate(
            publicLockUpgraded.address,
            currentVersion.toNumber() + 1
          )
          const tx = await unlock.upgradeLock(
            lock.address,
            currentVersion.toNumber() + 1
          )
          assert.equal(tx.logs[0].event, 'LockUpgraded')
        })
      })
    }
  })
})
