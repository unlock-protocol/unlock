const { ethers, upgrades } = require('hardhat')

const createLockHash = require('../helpers/createLockCalldata')
const {
  LATEST_UNLOCK_VERSION,
  LATEST_PUBLIC_LOCK_VERSION,
  ADDRESS_ZERO,
} = require('../helpers/constants')

const {
  getContractFactoryAtVersion,
  getUnlockVersionNumbers,
  getMatchingLockVersion,
  cleanupPastContracts,
} = require('../helpers/versions')

const unlockVersions = getUnlockVersionNumbers()

contract('Unlock / upgrades', async (accounts) => {
  const [unlockOwner, lockOwner, keyOwner] = await ethers.getSigners()
  const keyPrice = ethers.utils.parseUnits('0.01', 'ether')

  after(async () => await cleanupPastContracts())

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

      after(async () => await cleanupPastContracts())

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
        unlock = await upgrades.deployProxy(Unlock, [unlockOwner.address])

        // complete PublicLock configuration
        publicLock = await PublicLock.deploy()
        if (versionNumber < 7) {
          await unlock.configUnlock(publicLock.address, '', '')
          // Version 7 moved setLockTemplate to its own function
        } else {
          await unlock.setLockTemplate(publicLock.address)
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
        assert.equal(owner, unlockOwner.address)
      })

      it('this PublicLock version and latest PublicLock version have different bytecode', async () => {
        assert.notEqual(PublicLockLatest.bytecode, PublicLock.bytecode)
      })

      describe('Create a lock for testing', async () => {
        let lock

        beforeEach(async () => {
          // Create Lock
          let lockTx

          if (versionNumber >= 11) {
            const args = [
              60 * 60 * 24, // expirationDuration 1 day
              ADDRESS_ZERO, // token address
              keyPrice,
              5, // maxNumberOfKeys
              'UpgradeTestingLock',
            ]
            const calldata = await createLockHash({ args })
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
              'UpgradeTestingLock',
              web3.utils.randomHex(12)
            )
          } else if (versionNumber >= 3) {
            // Version 3 added a lock name
            lockTx = await unlock.connect(lockOwner).createLock(
              60 * 60 * 24, // expirationDuration 1 day
              ADDRESS_ZERO, // token address
              keyPrice,
              5, // maxNumberOfKeys
              'UpgradeTestingLock'
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

          const { events } = await lockTx.wait()
          const evt = events.find(({ event }) => event === 'NewLock')
          lock = await publicLock.attach(evt.args.newLockAddress)
        })

        it('PublicLock version is set', async () => {
          if (versionNumber >= 1) {
            // Version numbers were introduced to PublicLock with v1
            const templateVersion = await lock.publicLockVersion()
            const version =
              typeof templateVersion !== 'number'
                ? templateVersion.toNumber()
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
            originalLockData = await unlock.locks(lock.address)
          })

          it('Key has an ID', async () => {
            let id
            if (versionNumber >= 1) {
              // Version numbers were introduced to PublicLock with v1
              if ((await lock.publicLockVersion()) >= 10) {
                id = await lock.tokenOfOwnerByIndex(keyOwner.address, 0)
              } else {
                id = await lock.getTokenIdFor(keyOwner.address)
              }
              assert.equal(id.toNumber(), 1)
            }
          })

          it('Key is owned', async () => {
            if (versionNumber >= 9) {
              // isKeyOwner was remove in unlock v10
              const isOwned = await lock.balanceOf(keyOwner.address)
              assert.equal(isOwned.toNumber() > 0, true)
            } else if (versionNumber >= 1) {
              // isKeyOwner was introduced in v1
              const id = await lock.getTokenIdFor(keyOwner.address)
              const isOwned = await lock.isKeyOwner(id, keyOwner.address)
              assert.equal(isOwned, true)
            }
          })

          describe('Upgrade Unlock and PublicLock to latest version', () => {
            beforeEach(async () => {
              // upgrade proxy to latest
              unlock = await upgrades.upgradeProxy(
                unlock.address,
                UnlockLatest,
                { unsafeAllowRenames: true }
              )

              // lock template
              const publicLockLatestTemplate = await PublicLockLatest.deploy()
              await publicLockLatestTemplate.deployed()

              // set template
              if (
                (await unlock.proxyAdminAddress()) ===
                ethers.constants.AddressZero
              ) {
                await unlock.initializeProxyAdmin()
              }
              const version = await publicLockLatestTemplate.publicLockVersion()
              await unlock.addLockTemplate(
                publicLockLatestTemplate.address,
                version
              )
              await unlock.setLockTemplate(publicLockLatestTemplate.address)
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
              const id = await lock.getTokenIdFor(keyOwner.address)
              assert.notEqual(id, 0)
            })

            it('Key is still owned', async () => {
              if (versionNumber >= 9) {
                // isKeyOwner was remove in unlock v10
                const isOwned = await lock.balanceOf(keyOwner.address)
                assert.equal(isOwned.toNumber() > 0, true)
              } else if (versionNumber >= 1) {
                const id = await lock.getTokenIdFor(keyOwner.address)
                // isKeyOwner was introduced in v1
                const isOwned = await lock.isKeyOwner(id, keyOwner.address)
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
              const tx = await lock
                .connect(keyOwner)
                .transferFrom(
                  keyOwner.address,
                  accounts[8],
                  await lock.getTokenIdFor(keyOwner.address)
                )
              const { events } = await tx.wait()
              const evt = events.find(({ event }) => event === 'Transfer')
              assert.equal(evt.event, 'Transfer')
            })

            it('grossNetworkProduct remains', async () => {
              const grossNetworkProduct = await unlock.grossNetworkProduct()
              assert.equal(grossNetworkProduct, keyPrice)
            })

            it('lock data should persist state between upgrades', async () => {
              const resultsAfter = await unlock.locks(lock.address)

              assert.equal(resultsAfter.deployed, originalLockData.deployed)
              assert.equal(
                resultsAfter.yieldedDiscountTokens.toString(),
                originalLockData.yieldedDiscountTokens.toString()
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
                const calldata = await createLockHash({ args })
                const lockLatestTx = await unlock.createUpgradeableLock(
                  calldata
                )

                const { events } = await lockLatestTx.wait()
                const evt = events.find(({ event }) => event === 'NewLock')

                lockLatest = await PublicLockLatest.attach(
                  evt.args.newLockAddress
                )

                // Buy Key
                await lockLatest.purchase(
                  [],
                  [keyOwner.address],
                  [ADDRESS_ZERO],
                  [ADDRESS_ZERO],
                  [[]],
                  { value: keyPrice }
                )
              })

              it('grossNetworkProduct sums previous version purchases with new version purchases', async () => {
                const grossNetworkProduct = await unlock.grossNetworkProduct()
                assert.equal(
                  grossNetworkProduct.eq(
                    ethers.BigNumber.from(keyPrice).mul(2)
                  ),
                  true
                )
              })

              it('Latest Key is owned', async () => {
                const id = await lockLatest.tokenOfOwnerByIndex(
                  keyOwner.address,
                  0
                )
                assert.equal(await lockLatest.ownerOf(id), keyOwner.address)
              })

              it('Latest publicLock version is correct', async () => {
                const publicLockVersion = await (
                  await lockLatest.publicLockVersion()
                ).toString()
                assert.equal(publicLockVersion, LATEST_PUBLIC_LOCK_VERSION)
              })
            })
          })
        })
      })

      async function purchaseKey(lock) {
        if (versionNumber >= 11) {
          // Lock Version 11 multiple purchases
          return await lock
            .connect(lockOwner)
            .purchase(
              [],
              [keyOwner.address],
              [ADDRESS_ZERO],
              [ADDRESS_ZERO],
              [[]],
              {
                value: keyPrice,
              }
            )
        }
        if (versionNumber >= 9) {
          // Lock Version 9 (used by Unlock v10) added keyManager to purchase
          return await lock
            .connect(lockOwner)
            .purchase(0, keyOwner.address, ADDRESS_ZERO, ADDRESS_ZERO, [], {
              value: keyPrice,
            })
        }
        if (versionNumber >= 5) {
          // Version 5 renamed to purchase, added keyPrice, referrer, and data
          return await lock
            .connect(lockOwner)
            .purchase(0, keyOwner.address, ADDRESS_ZERO, [], {
              value: keyPrice,
            })
        }
        if (versionNumber >= 1) {
          // Version 1 removed the keyData field
          return await lock.connect(lockOwner).purchaseFor(keyOwner.address, {
            value: keyPrice,
          })
        }

        return await lock
          .connect(keyOwner)
          .purchaseFor(keyOwner.address, web3.utils.toHex('Julien'), {
            value: keyPrice,
          })
      }
    })
  }
})
