const BN = require('bignumber.js')
const { constants } = require('hardlydifficult-ethereum-contracts')

const { ethers, upgrades, artifacts } = require('hardhat')
const { exportVersionedArtifacts } = require('../../helpers/versions')

// copy all versions from npm after start
exportVersionedArtifacts()

const versionsCount = 9

let unlock

const UnlockLatest = artifacts.require('Unlock')
const PublicLockLatest = artifacts.require('PublicLock')

contract('Unlock / upgrades', (accounts) => {
  const unlockOwner = accounts[9]
  const lockOwner = accounts[1]
  const keyOwner = accounts[2]
  const keyPrice = web3.utils.toWei('0.01', 'ether')

  for (let versionNumber = 0; versionNumber < 1; versionNumber++) {
    describe(`Testing version ${versionNumber}`, () => {
      let Unlock
      let originalLockData
      const unlockVersion = `UnlockV${versionNumber}`

      beforeEach(async () => {
        // await exportVersionedArtifacts()
        Unlock = await ethers.getContractFactory(unlockVersion)

        // deploy instance
        if (versionNumber === 0) {
          unlock = await upgrades.deployProxy(Unlock, [unlockOwner])
        } else {
          unlock = await upgrades.upgradeProxy(unlock.address, Unlock)
        }
      })

      it('Unlock version is set', async () => {
        if (versionNumber >= 2) {
          // Version numbers were introduced to Unlock with v2
          const version = await unlock.unlockVersion()
          assert.equal(version, versionNumber)
        }
      })

      it('this version and latest version have different Unlock bytecode', async () => {
        assert.notEqual(UnlockLatest.abi.bytecode, Unlock.bytecode)
      })

      it('Unlock has an owner', async () => {
        const owner = await unlock.owner()
        assert.equal(owner, unlockOwner)
      })

      if (versionsCount && versionNumber <= versionsCount) {
        describe('Complete PublicLock configuration if require', () => {
          let publicLockAbi
          let publicLockTemplate

          beforeEach(async () => {
            publicLockAbi = artifacts.require('PublicLock')

            if (versionNumber >= 5) {
              // The lock minimal proxy was introduced with version 5
              const lockTemplate = await publicLockAbi.new({
                from: unlockOwner,
                gas: constants.MAX_GAS,
              })
              publicLockTemplate = await publicLockAbi.at(lockTemplate.address)

              if (versionNumber >= 7) {
                // Version 7 moved setLockTemplate to its own function
                await unlock.setLockTemplate(publicLockTemplate.address, {
                  from: unlockOwner,
                  gas: constants.MAX_GAS,
                })
              } else {
                await unlock.configUnlock(lockTemplate.address, '', '', {
                  from: unlockOwner,
                  gas: constants.MAX_GAS,
                })
              }
            }
          })

          it('this version and latest version have different PublicLock bytecode', async () => {
            assert.notEqual(PublicLockLatest.bytecode, publicLockAbi.bytecode)
          })

          describe('Create a lock for testing', async () => {
            let lock

            beforeEach(async () => {
              // Create Lock
              let lockTx

              if (versionNumber >= 5) {
                // Version 5 introduced `create2`, requiring a salt
                lockTx = await unlock.createLock(
                  60 * 60 * 24, // expirationDuration 1 day
                  web3.utils.padLeft(0, 40), // token address
                  keyPrice,
                  5, // maxNumberOfKeys
                  'UpgradeTestingLock',
                  // web3.utils.randomHex(12),
                  '0x950c4fa9d9ae57edb7f2ccca', // hardcoded so we reuse the same address
                  {
                    from: lockOwner,
                    gas: constants.MAX_GAS,
                  }
                )
              } else if (versionNumber >= 3) {
                // Version 3 added a lock name
                lockTx = await unlock.createLock(
                  60 * 60 * 24, // expirationDuration 1 day
                  web3.utils.padLeft(0, 40), // token address
                  keyPrice,
                  5, // maxNumberOfKeys
                  'UpgradeTestingLock',
                  {
                    from: lockOwner,
                    gas: constants.MAX_GAS,
                  }
                )
              } else if (versionNumber >= 1) {
                // Version 1 added ERC-20 support, requiring a tokenAddress
                lockTx = await unlock.createLock(
                  60 * 60 * 24, // expirationDuration 1 day
                  web3.utils.padLeft(0, 40), // token address
                  keyPrice,
                  5, // maxNumberOfKeys
                  {
                    from: lockOwner,
                    gas: constants.MAX_GAS,
                  }
                )
              } else {
                lockTx = await unlock.createLock(
                  60 * 60 * 24, // expirationDuration 1 day
                  keyPrice,
                  5, // maxNumberOfKeys
                  {
                    from: lockOwner,
                    gas: constants.MAX_GAS,
                  }
                )
              }

              const evt = lockTx.logs.find((v) => v.event === 'NewLock')
              // console.log(`lock created at ${evt.args.newLockAddress}`)
              lock = await publicLockAbi.at(evt.args.newLockAddress)
              // console.log(
              //   'lock version',
              //   await (await lock.publicLockVersion()).toString()
              // )
            })

            it('PublicLock version is set', async () => {
              if (versionNumber >= 1) {
                // Version numbers were introduced to PublicLock with v1
                const version = await lock.publicLockVersion()
                if (versionNumber == 2) {
                  // version 2 had a bug: we forgot to bump the lock version
                  assert.equal(version, 1)
                } else {
                  assert.equal(version, versionNumber)
                }
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
                const id = await lock.getTokenIdFor(keyOwner)
                assert.notEqual(id, 0)
              })

              it('Key is owned', async () => {
                if (versionNumber >= 1) {
                  // isKeyOwner was introduced in v1
                  const id = await lock.getTokenIdFor(keyOwner)
                  const isOwned = await lock.isKeyOwner(id, keyOwner)
                  assert.equal(isOwned, true)
                }
              })

              describe('Upgrade Unlock to latest version', () => {
                beforeEach(async () => {
                  // upgrade proxy to latest
                  unlock = await upgrades.upgradeProxy(
                    unlock.address,
                    UnlockLatest
                  )

                  // lock template
                  const publicLockLatestTemplate = await PublicLockLatest.new({
                    from: unlockOwner,
                    gas: constants.MAX_GAS,
                  })

                  await unlock.setLockTemplate(
                    publicLockLatestTemplate.address,
                    {
                      from: unlockOwner,
                      gas: constants.MAX_GAS,
                    }
                  )
                })

                it('this version and latest version have different Unlock version numbers', async () => {
                  const version = await unlock.unlockVersion()
                  assert.notEqual(version, versionNumber)
                })

                it('latest version number is correct', async () => {
                  const version = await (
                    await unlock.unlockVersion()
                  ).toNumber()
                  assert.equal(version, versionsCount)
                })

                it('Key id still set', async () => {
                  const id = await lock.getTokenIdFor(keyOwner)
                  assert.notEqual(id, 0)
                })

                it('Key is still owned', async () => {
                  // console.log(keyOwner)
                  const id = await lock.getTokenIdFor(keyOwner)
                  if (versionNumber >= 1) {
                    // isKeyOwner was introduced in v1
                    const bool = await lock.isKeyOwner(id, keyOwner)
                    assert.equal(bool, true)
                  }
                })

                it('New keys may still be purchased', async () => {
                  if (versionNumber >= 1) {
                    // version 0 purchases no longer work due to a change in Unlock.sol
                    await purchaseKey(lock)
                  }
                })

                it('Keys may still be transferred', async () => {
                  const tx = await lock.transferFrom(
                    keyOwner,
                    accounts[8],
                    await lock.getTokenIdFor(keyOwner),
                    {
                      from: keyOwner,
                      gas: constants.MAX_GAS,
                    }
                  )
                  const evt = tx.logs.find((v) => v.event === 'Transfer')
                  assert.equal(evt.event, 'Transfer')
                })

                it('grossNetworkProduct remains', async () => {
                  const grossNetworkProduct = new BN(
                    await unlock.grossNetworkProduct()
                  )
                  assert.equal(
                    grossNetworkProduct.toString(),
                    new BN(keyPrice).toString()
                  )
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
                    const lockLatestTx = await unlock.createLock(
                      60 * 60 * 24, // expirationDuration 1 day
                      web3.utils.padLeft(0, 40),
                      keyPrice,
                      5, // maxNumberOfKeys
                      'After-Upgrade Lock',
                      '0x950c4fa9d9ae57edb7f2ccca', // web3.utils.randomHex(12),
                      {
                        from: lockOwner,
                        gas: constants.MAX_GAS,
                      }
                    )

                    const evt = lockLatestTx.logs.find(
                      (v) => v.event === 'NewLock'
                    )
                    lockLatest = await PublicLockLatest.at(
                      evt.args.newLockAddress
                    )
                    PublicLockLatest.setAsDeployed(lockLatest)

                    // Buy Key
                    await lockLatest.purchase(
                      0,
                      keyOwner,
                      web3.utils.padLeft(0, 40),
                      [],
                      {
                        value: keyPrice,
                        from: keyOwner,
                        gas: constants.MAX_GAS,
                      }
                    )
                  })

                  it('this version and latest version have different PublicLock version numbers', async () => {
                    const version = await lockLatest.publicLockVersion()
                    assert.notEqual(await version.toNumber(), versionNumber)
                  })

                  it('grossNetworkProduct sums previous version purchases with new version purchases', async () => {
                    const grossNetworkProduct = new BN(
                      await unlock.grossNetworkProduct()
                    )
                    assert.equal(
                      grossNetworkProduct.toFixed(),
                      new BN(keyPrice).times(2).toFixed()
                    )
                  })

                  it('Latest Key is owned', async () => {
                    const id = await lockLatest.getTokenIdFor(keyOwner)
                    const isOwned = await lockLatest.isKeyOwner(id, keyOwner)
                    assert.equal(isOwned, true)
                  })

                  it('Latest publicLock version is correct', async () => {
                    const publicLockVersion = await (
                      await lockLatest.publicLockVersion()
                    ).toString()
                    assert.equal(publicLockVersion, versionsCount - 1)
                  })
                })
              })
            })
          })
        })
      }
      async function purchaseKey(lock) {
        if (versionNumber >= 5) {
          // Version 5 renamed to purchase, added keyPrice, referrer, and data
          return await lock.purchase(
            0,
            keyOwner,
            accounts[2],
            // web3.utils.padLeft(0, 40),
            [],
            {
              value: keyPrice,
              from: keyOwner,
              // gas: constants.MAX_GAS,
            }
          )
        }
        if (versionNumber >= 1) {
          // Version 1 removed the keyData field
          return await lock.purchaseFor(keyOwner, {
            value: keyPrice,
            from: keyOwner,
            gas: constants.MAX_GAS,
          })
        }
        // for v0
        return await lock.purchaseFor(keyOwner, web3.utils.toHex('Julien'), {
          value: keyPrice,
          from: keyOwner,
          gas: constants.MAX_GAS,
        })
      }
    })
  }
})
