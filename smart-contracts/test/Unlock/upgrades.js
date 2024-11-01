const assert = require('assert')
const { ethers } = require('hardhat')

const {
  createLockCalldata,
  cleanupContractVersions,
  getEvent,
} = require('@unlock-protocol/hardhat-helpers')

const {
  LATEST_UNLOCK_VERSION,
  LATEST_PUBLIC_LOCK_VERSION,
  ADDRESS_ZERO,
  getContractFactoryAtVersion,
  getUnlockVersionNumbers,
  getMatchingLockVersion,
  deployUpgreadableContract,
  upgradeUpgreadableContract,
} = require('../helpers')

const unlockVersions = getUnlockVersionNumbers()
const keyPrice = ethers.parseUnits('0.01', 'ether')

describe('Unlock / upgrades', () => {
  let unlockOwner, lockOwner, keyOwner, anotherAccount

  before(async () => {
    ;[unlockOwner, lockOwner, keyOwner, anotherAccount] =
      await ethers.getSigners()
  })

  after(async () => await cleanupContractVersions(__dirname))

  for (let i = 0; i < unlockVersions.length; i++) {
    const unlockVersion = unlockVersions[i]

    describe(`Testing Unlock upgrade v${unlockVersion} > v${LATEST_UNLOCK_VERSION}`, () => {
      let unlock
      let Unlock
      let UnlockLatest

      let publicLock
      let PublicLock
      let PublicLockLatest

      let originalLockData
      let proxyAdmin

      after(async () => await cleanupContractVersions(__dirname))

      before(async function copyAndBuildContract() {
        // make sure mocha doesnt time out
        this.timeout(200000)

        // unlock versions
        Unlock = await getContractFactoryAtVersion('Unlock', unlockVersion)
        UnlockLatest = await ethers.getContractFactory(
          'contracts/Unlock.sol:Unlock'
        )

        // template versions
        PublicLock = await getContractFactoryAtVersion(
          'PublicLock',
          getMatchingLockVersion(unlockVersion)
        )
        PublicLockLatest = await ethers.getContractFactory(
          'contracts/PublicLock.sol:PublicLock'
        )
      })

      beforeEach(async () => {
        // deploy a new Unlock instance
        ;({ contract: unlock, proxyAdmin } = await deployUpgreadableContract(
          Unlock,
          [await unlockOwner.getAddress()]
        ))

        // complete PublicLock configuration
        publicLock = await PublicLock.deploy()
        const publicLockVersion = await publicLock.publicLockVersion()
        await unlock.addLockTemplate(
          await publicLock.getAddress(),
          publicLockVersion
        )
        await unlock.setLockTemplate(await publicLock.getAddress())
      })

      it('Unlock version is set', async () => {
        const version = await unlock.unlockVersion()
        assert.equal(version, unlockVersion)
      })

      it('this version and latest version have different Unlock bytecode', async () => {
        assert.notEqual(UnlockLatest.bytecode, Unlock.bytecode)
      })

      it('Unlock has an owner', async () => {
        const owner = await unlock.owner()
        assert.equal(owner, await unlockOwner.getAddress())
      })

      describe('Create a lock for testing', async () => {
        let lock
        let lockName
        let lockKeyPrice
        let lockExpirationDuration
        let lockMaxNumberOfKeys

        beforeEach(async () => {
          // Create Lock
          let lockTx

          const args = [
            60 * 60 * 24, // expirationDuration 1 day
            ADDRESS_ZERO, // token address
            keyPrice,
            5, // maxNumberOfKeys
            `UpgradeTestingLock ${unlockVersion}`,
          ]
          const calldata = await createLockCalldata({ args })
          lockTx = await unlock
            .connect(lockOwner)
            .createUpgradeableLock(calldata)

          const receipt = await lockTx.wait()
          const evt = await getEvent(receipt, 'NewLock')
          lock = await publicLock.attach(evt.args.newLockAddress)
          lockName = await lock.name()
          lockKeyPrice = await lock.keyPrice()
          lockExpirationDuration = await lock.expirationDuration()
          lockMaxNumberOfKeys = await lock.maxNumberOfKeys()
        })

        it('lock tempalte version is correct', async () => {
          const template = await PublicLock.attach(
            await unlock.publicLockAddress()
          )
          const lockVersion = await lock.publicLockVersion()
          const templateVersion = await template.publicLockVersion()
          assert.equal(lockVersion, templateVersion)
        })

        describe('Purchase a key', () => {
          beforeEach(async () => {
            // Buy Key
            await purchaseKey(lock)

            // Record sample lock data
            originalLockData = await unlock.locks(await lock.getAddress())
          })

          it('Key has an ID', async () => {
            const id = await lock.tokenOfOwnerByIndex(
              await keyOwner.getAddress(),
              0
            )
            assert.equal(id, 1)
          })

          it('Key is owned', async () => {
            const isOwned = await lock.balanceOf(await keyOwner.getAddress())
            assert.equal(isOwned > 0, true)
          })

          describe('Upgrade Unlock and PublicLock to latest version', () => {
            beforeEach(async () => {
              // upgrade proxy to latest
              unlock = await upgradeUpgreadableContract(
                await unlock.getAddress(),
                await proxyAdmin.getAddress(),
                UnlockLatest
              )

              // lock template
              const publicLockLatestTemplate = await PublicLockLatest.deploy()

              // set template
              if ((await unlock.proxyAdminAddress()) === ethers.ZeroAddress) {
                await unlock.initializeProxyAdmin()
              }
              const version = await publicLockLatestTemplate.publicLockVersion()
              await unlock.addLockTemplate(
                await publicLockLatestTemplate.getAddress(),
                version
              )
              await unlock.setLockTemplate(
                await publicLockLatestTemplate.getAddress()
              )
            })

            it('this version and latest version have different Unlock version numbers', async () => {
              const version = await unlock.unlockVersion()
              assert.notEqual(version, unlockVersion)
            })

            it('latest version number is correct', async () => {
              const version = await await unlock.unlockVersion()
              assert.equal(version, LATEST_UNLOCK_VERSION)
            })

            it('Key id still set', async () => {
              const id = await lock.tokenOfOwnerByIndex(
                await keyOwner.getAddress(),
                0
              )
              assert.notEqual(id, 0)
            })

            it('Key is still owned', async () => {
              const isOwned = await lock.balanceOf(await keyOwner.getAddress())
              assert.equal(isOwned > 0, true)
            })

            it('New keys may still be purchased', async () => {
              await purchaseKey(lock)
            })

            it('Keys may still be transferred', async () => {
              const id = await lock.tokenOfOwnerByIndex(
                await keyOwner.getAddress(),
                0
              )
              const tx = await lock
                .connect(keyOwner)
                .transferFrom(
                  await keyOwner.getAddress(),
                  await anotherAccount.getAddress(),
                  id
                )
              const receipt = await tx.wait()
              const evt = await getEvent(receipt, 'Transfer')
              assert.equal(evt.event.fragment.name, 'Transfer')
            })

            it('grossNetworkProduct remains', async () => {
              const grossNetworkProduct = await unlock.grossNetworkProduct()
              assert.equal(grossNetworkProduct, keyPrice)
            })

            it('should persist the lock name between upgrades', async () => {
              const name = await lock.name()
              assert.equal(name, lockName)
            })

            it('should persist the keyPrice between upgrades', async () => {
              const price = await lock.keyPrice()
              assert.equal(price, lockKeyPrice)
            })

            it('should persist the expirationDuration between upgrades', async () => {
              const expirationDuration = await lock.expirationDuration()
              assert.equal(expirationDuration, lockExpirationDuration)
            })

            it('should persist the maxNumberOfKeys between upgrades', async () => {
              const maxNumberOfKeys = await lock.maxNumberOfKeys()
              assert.equal(maxNumberOfKeys, lockMaxNumberOfKeys)
            })

            it('lock data should persist state between upgrades', async () => {
              const resultsAfter = await unlock.locks(await lock.getAddress())
              assert.equal(resultsAfter.deployed, originalLockData.deployed)
              assert.equal(
                resultsAfter.yieldedDiscountTokens,
                originalLockData.yieldedDiscountTokens
              )
            })

            it('tokenURI still works as expected', async () => {
              await lock.tokenURI(1)
            })

            describe('Using latest version after an upgrade', () => {
              let lockLatest

              beforeEach(async () => {
                // Create a new Lock
                const args = [
                  60 * 60 * 24, // expirationDuration 1 day
                  ADDRESS_ZERO, // token address
                  keyPrice,
                  5, // maxNumberOfKeys
                  'After-Upgrade Lock',
                ]
                const calldata = await createLockCalldata({ args })
                const lockLatestTx =
                  await unlock.createUpgradeableLock(calldata)

                const receipt = await lockLatestTx.wait()
                const evt = await getEvent(receipt, 'NewLock')

                lockLatest = await PublicLockLatest.attach(
                  evt.args.newLockAddress
                )

                // Buy Key
                await lockLatest.purchase(
                  [],
                  [await keyOwner.getAddress()],
                  [ADDRESS_ZERO],
                  [ADDRESS_ZERO],
                  ['0x'],
                  { value: keyPrice }
                )
              })

              it('grossNetworkProduct sums previous version purchases with new version purchases', async () => {
                const grossNetworkProduct = await unlock.grossNetworkProduct()
                assert.equal(grossNetworkProduct == keyPrice * 2n, true)
              })

              it('Latest Key is owned', async () => {
                const id = await lockLatest.tokenOfOwnerByIndex(
                  await keyOwner.getAddress(),
                  0
                )
                assert.equal(
                  await lockLatest.ownerOf(id),
                  await keyOwner.getAddress()
                )
              })

              it('Latest publicLock version is correct', async () => {
                const publicLockVersion = await lockLatest.publicLockVersion()
                assert.equal(publicLockVersion, LATEST_PUBLIC_LOCK_VERSION)
              })
            })
          })
        })
      })

      async function purchaseKey(lock) {
        const publicLockVersion = await lock.publicLockVersion()

        // set multiple purchases per address
        if (publicLockVersion >= 12) {
          await lock.updateLockConfig(
            await lock.expirationDuration(),
            await lock.maxNumberOfKeys(),
            10
          )
        } else if (publicLockVersion >= 11) {
          await lock.setMaxKeysPerAddress(10)
        }
        if (publicLockVersion >= 11) {
          // Lock Version 11 multiple purchases
          return await lock
            .connect(lockOwner)
            .purchase(
              [],
              [await keyOwner.getAddress()],
              [ADDRESS_ZERO],
              [ADDRESS_ZERO],
              ['0x'],
              {
                value: keyPrice,
              }
            )
        }

        return await lock
          .connect(keyOwner)
          .purchaseFor(
            await keyOwner.getAddress(),
            ethers.hexlify(ethers.toUtf8Bytes('Julien')),
            {
              value: keyPrice,
            }
          )
      }
    })
  }
})
