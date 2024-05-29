const { assert } = require('chai')
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
    const versionNumber = unlockVersions[i]

    describe(`Testing version ${versionNumber}`, () => {
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

        Unlock = await getContractFactoryAtVersion('Unlock', versionNumber)
        PublicLock = await getContractFactoryAtVersion(
          'PublicLock',
          getMatchingLockVersion(versionNumber)
        )

        UnlockLatest = await ethers.getContractFactory(
          'contracts/Unlock.sol:Unlock'
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
        if (versionNumber < 7) {
          await unlock.configUnlock(await publicLock.getAddress(), '', '')
          // Version 7 moved setLockTemplate to its own function
        } else {
          if (publicLockVersion >= 11) {
            await unlock.addLockTemplate(
              await publicLock.getAddress(),
              publicLockVersion
            )
          }
          await unlock.setLockTemplate(await publicLock.getAddress())
        }
      })

      it('Unlock version is set', async () => {
        // Version numbers were introduced to Unlock with v2
        const version = await unlock.unlockVersion()
        assert.equal(version, versionNumber)
      })

      it('this version and latest version have different Unlock bytecode', async () => {
        assert.notEqual(UnlockLatest.bytecode, Unlock.bytecode)
      })

      it('Unlock has an owner', async () => {
        const owner = await unlock.owner()
        assert.equal(owner, await unlockOwner.getAddress())
      })

      it('this PublicLock version and latest PublicLock version have different bytecode', async () => {
        assert.notEqual(PublicLockLatest.bytecode, PublicLock.bytecode)
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
          if (versionNumber >= 11) {
            const args = [
              60 * 60 * 24, // expirationDuration 1 day
              ADDRESS_ZERO, // token address
              keyPrice,
              5, // maxNumberOfKeys
              `UpgradeTestingLock ${versionNumber}`,
            ]
            const calldata = await createLockCalldata({ args })
            lockTx = await unlock
              .connect(lockOwner)
              .createUpgradeableLock(calldata)
          } else if (versionNumber >= 5) {
            // Version 5 introduced `create2`, requiring a salt
            lockTx = await unlock.connect(lockOwner).createLock(
              60 * 60 * 24, // expirationDuration 1 day
              ADDRESS_ZERO, // token address
              keyPrice,
              5, // maxNumberOfKeys
              `UpgradeTestingLock ${versionNumber}`,
              ethers.hexlify(ethers.randomBytes(12))
            )
          } else if (versionNumber >= 3) {
            // Version 3 added a lock name
            lockTx = await unlock.connect(lockOwner).createLock(
              60 * 60 * 24, // expirationDuration 1 day
              ADDRESS_ZERO, // token address
              keyPrice,
              5, // maxNumberOfKeys
              `UpgradeTestingLock ${versionNumber}`
            )
          } else if (versionNumber >= 1) {
            // Version 1 added ERC-20 support, requiring a tokenAddress
            lockTx = await unlock.connect(lockOwner).createLock(
              60 * 60 * 24, // expirationDuration 1 day
              ADDRESS_ZERO, // token address
              keyPrice,
              5 // maxNumberOfKeys
            )
          } else {
            lockTx = await unlock.connect(lockOwner).createLock(
              60 * 60 * 24, // expirationDuration 1 day
              keyPrice,
              5 // maxNumberOfKeys
            )
          }

          const receipt = await lockTx.wait()
          const evt = await getEvent(receipt, 'NewLock')
          lock = await publicLock.attach(evt.args.newLockAddress)
          lockName = await lock.name()
          lockKeyPrice = await lock.keyPrice()
          lockExpirationDuration = await lock.expirationDuration()
          lockMaxNumberOfKeys = await lock.maxNumberOfKeys()
        })

        it('PublicLock version is set', async () => {
          if (versionNumber >= 1) {
            // Version numbers were introduced to PublicLock with v1
            const templateVersion = await lock.publicLockVersion()
            const version =
              typeof templateVersion !== 'number'
                ? templateVersion.toString()
                : templateVersion

            assert.equal(
              version,
              // see - decouple contracts versions after v10
              versionNumber === 10 ? 9 : versionNumber
            )
          }
        })

        describe('Purchase a key', () => {
          beforeEach(async () => {
            // Buy Key
            await purchaseKey(lock)

            // Record sample lock data
            originalLockData = await unlock.locks(await lock.getAddress())
          })

          it('Key has an ID', async () => {
            let id
            if (versionNumber >= 1) {
              // Version numbers were introduced to PublicLock with v1
              if ((await lock.publicLockVersion()) >= 10) {
                id = await lock.tokenOfOwnerByIndex(
                  await keyOwner.getAddress(),
                  0
                )
              } else {
                id = await lock.getTokenIdFor(await keyOwner.getAddress())
              }
              assert.equal(id, 1)
            }
          })

          it('Key is owned', async () => {
            if (versionNumber >= 9) {
              // isKeyOwner was remove in unlock v10
              const isOwned = await lock.balanceOf(await keyOwner.getAddress())
              assert.equal(isOwned > 0, true)
            } else if (versionNumber >= 1) {
              // isKeyOwner was introduced in v1
              const id = await lock.getTokenIdFor(await keyOwner.getAddress())
              const isOwned = await lock.isKeyOwner(
                id,
                await keyOwner.getAddress()
              )
              assert.equal(isOwned, true)
            }
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
              assert.notEqual(version, versionNumber)
            })

            it('latest version number is correct', async () => {
              const version = await await unlock.unlockVersion()
              assert.equal(version, LATEST_UNLOCK_VERSION)
            })

            it('Key id still set', async () => {
              let id
              if ((await lock.publicLockVersion()) >= 10) {
                id = await lock.tokenOfOwnerByIndex(
                  await keyOwner.getAddress(),
                  0
                )
              } else {
                id = await lock.getTokenIdFor(await keyOwner.getAddress())
              }
              assert.notEqual(id, 0)
            })

            it('Key is still owned', async () => {
              if (versionNumber >= 9) {
                // isKeyOwner was remove in unlock v10
                const isOwned = await lock.balanceOf(
                  await keyOwner.getAddress()
                )
                assert.equal(isOwned > 0, true)
              } else if (versionNumber >= 1) {
                const id = await lock.getTokenIdFor(await keyOwner.getAddress())
                // isKeyOwner was introduced in v1
                const isOwned = await lock.isKeyOwner(
                  id,
                  await keyOwner.getAddress()
                )
                assert.equal(isOwned, true)
              }
            })

            it('New keys may still be purchased', async () => {
              if (versionNumber >= 1) {
                // version 0 purchases no longer work due to a change in Unlock.sol
                await purchaseKey(lock)
              }
            })

            it('Keys may still be transferred', async () => {
              let id
              if ((await lock.publicLockVersion()) >= 10) {
                id = await lock.tokenOfOwnerByIndex(
                  await keyOwner.getAddress(),
                  0
                )
              } else {
                id = await lock.getTokenIdFor(await keyOwner.getAddress())
              }
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
              if (versionNumber >= 3) {
                // tokenURI was introduced with v3
                await lock.tokenURI(1)
              }
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
                const publicLockVersion =
                  await await lockLatest.publicLockVersion()
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
        if (publicLockVersion >= 9) {
          // Lock Version 9 (used by Unlock v10) added keyManager to purchase
          return await lock
            .connect(lockOwner)
            .purchase(
              0,
              await keyOwner.getAddress(),
              ADDRESS_ZERO,
              ADDRESS_ZERO,
              '0x',
              {
                value: keyPrice,
              }
            )
        }
        if (publicLockVersion >= 5) {
          // Version 5 renamed to purchase, added keyPrice, referrer, and data
          return await lock
            .connect(lockOwner)
            .purchase(0, await keyOwner.getAddress(), ADDRESS_ZERO, '0x', {
              value: keyPrice,
            })
        }
        if (publicLockVersion >= 1) {
          // Version 1 removed the keyData field
          return await lock
            .connect(lockOwner)
            .purchaseFor(await keyOwner.getAddress(), {
              value: keyPrice,
            })
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
