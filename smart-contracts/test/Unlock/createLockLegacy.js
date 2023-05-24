const { ethers } = require('hardhat')

const { ADDRESS_ZERO, deployContracts } = require('../helpers')

let unlock
let lock
let publicLockUpgraded

contract('Unlock / createLock (Legacy)', () => {
  before(async () => {
    // setup Unlock
    ;({ unlock } = await deployContracts())

    // deploy new implementation
    const PublicLockUpgraded = await ethers.getContractFactory(
      'TestPublicLockUpgraded'
    )
    publicLockUpgraded = await PublicLockUpgraded.deploy()
    await publicLockUpgraded.deployed()
    const currentVersion = await unlock.publicLockLatestVersion()
    await unlock.addLockTemplate(
      publicLockUpgraded.address,
      currentVersion.toNumber() + 1
    )
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
          const tx = await unlock.createLock(...args, salt)
          const evt = tx.logs.find((v) => v.event === 'NewLock')
          lock = await ethers.getContractAt(
            'contracts/PublicLock.sol:PublicLock',
            evt.args.newLockAddress
          )
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
          const tx = await unlock.upgradeLock(
            lock.address,
            (await lock.publicLockVersion()) + 1
          )
          assert.equal(tx.logs[0].event, 'LockUpgraded')
        })
      })
    }
  })
})
