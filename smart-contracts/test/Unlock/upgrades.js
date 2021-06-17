const path = require('path')
const BN = require('bignumber.js')
const { constants } = require('hardlydifficult-ethereum-contracts')

const { deployments, artifacts } = require('hardhat')

const UnlockAbis = [
  // eslint-disable-next-line global-require
  require('@unlock-protocol/unlock-abi-1/Unlock'), // 0
  // eslint-disable-next-line global-require
  require('@unlock-protocol/unlock-abi-1/Unlock'), // 1
  // eslint-disable-next-line global-require
  require('@unlock-protocol/unlock-abi-2/Unlock'), // 2
  // eslint-disable-next-line global-require
  require('@unlock-protocol/unlock-abi-3/Unlock'), // 3
  // eslint-disable-next-line global-require
  require('@unlock-protocol/unlock-abi-4/Unlock'), // 4
  // eslint-disable-next-line global-require
  require('@unlock-protocol/unlock-abi-5/Unlock'), // 5
  // eslint-disable-next-line global-require
  require('@unlock-protocol/unlock-abi-6/Unlock'), // 6
  // eslint-disable-next-line global-require
  require('@unlock-protocol/unlock-abi-7/Unlock'), // 7
  // eslint-disable-next-line global-require
  require('@unlock-protocol/unlock-abi-8/Unlock'), // 8
]

const PublicLockAbis = [
  // eslint-disable-next-line global-require
  require('@unlock-protocol/unlock-abi-0/PublicLock'),
  // eslint-disable-next-line global-require
  require('@unlock-protocol/unlock-abi-1/PublicLock'),
  // eslint-disable-next-line global-require
  require('@unlock-protocol/unlock-abi-2/PublicLock'),
  // eslint-disable-next-line global-require
  require('@unlock-protocol/unlock-abi-3/PublicLock'),
  // eslint-disable-next-line global-require
  require('@unlock-protocol/unlock-abi-4/PublicLock'),
  // eslint-disable-next-line global-require
  require('@unlock-protocol/unlock-abi-5/PublicLock'),
  // eslint-disable-next-line global-require
  require('@unlock-protocol/unlock-abi-6/PublicLock'),
  // eslint-disable-next-line global-require
  require('@unlock-protocol/unlock-abi-7/PublicLock'),
]

let proxy
let unlock

const UnlockLatest = artifacts.require('Unlock')
const PublicLockLatest = artifacts.require('PublicLock')

contract('Unlock / upgrades', (accounts) => {
  const unlockOwner = accounts[9]
  const lockOwner = accounts[1]
  const keyOwner = accounts[2]
  const keyPrice = web3.utils.toWei('0.01', 'ether')

  const deployProxy = deployments.createFixture(
    async ({ deployments }, abi) =>
      await deployments.deploy('UnlockProxied', {
        contract: abi,
        from: unlockOwner,
        skipIfAlreadyDeployed: false,
        log: true,
        proxy: {
          owner: unlockOwner,
          proxyContract: 'OpenZeppelinTransparentProxy',
          execute: {
            init: {
              methodName: 'initialize',
              args: [unlockOwner],
            },
          },
        },
      })
  )

  for (
    let versionNumber = 0;
    versionNumber < UnlockAbis.length;
    versionNumber++
  ) {
    describe(`Testing version ${versionNumber}`, () => {
      let unlockAbi
      let originalLockData

      beforeEach(async () => {
        // force to fetch contracts artifact from node_modules
        artifacts._artifactsPath = path.resolve(
          __dirname,
          `../../node_modules/@unlock-protocol/unlock-abi-${versionNumber}`
        )
        unlockAbi = artifacts.require('Unlock')

        // deploy instance using hardhat-deploy
        proxy = await deployProxy(unlockAbi.toJSON())

        // pass proxy address to truffle contract instance
        unlock = await unlockAbi.at(proxy.address)

        // needed, from hardhat docs "Migrate to Truffle"
        unlockAbi.setAsDeployed(unlock)
      })

      it('Unlock version is set', async () => {
        if (versionNumber >= 2) {
          // Version numbers were introduced to Unlock with v2
          const version = await unlock.unlockVersion()
          assert.equal(version, versionNumber)
        }
      })

      it('this version and latest version have different Unlock bytecode', async () => {
        assert.notEqual(UnlockLatest.abi.bytecode, unlockAbi.bytecode)
      })

      it('Unlock has an owner', async () => {
        const owner = await unlock.owner()
        assert.equal(owner, unlockOwner)
      })

      if (PublicLockAbis && PublicLockAbis[versionNumber]) {
        describe('Complete PublicLock configuration if require', () => {
          let publicLockAbi

          beforeEach(async () => {
            publicLockAbi = artifacts.require('PublicLock')

            if (versionNumber >= 5) {
              // The lock minimal proxy was introduced with version 5
              const lockTemplate = await publicLockAbi.new({
                from: unlockOwner,
                gas: constants.MAX_GAS,
              })
              publicLockAbi.setAsDeployed(lockTemplate)

              if (versionNumber >= 7) {
                // Version 7 moved setLockTemplate to its own function
                await unlock.setLockTemplate(lockTemplate.address, {
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

          describe('Create a lock for testing', () => {
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
                  web3.utils.randomHex(12),
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
              lock = await publicLockAbi.at(evt.args.newLockAddress)
              publicLockAbi.setAsDeployed(lock)
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
                  proxy = await deployProxy(UnlockLatest.toJSON())

                  // init truffle instance w address
                  unlock = await UnlockLatest.at(proxy.address)
                  UnlockLatest.setAsDeployed(unlock)

                  // lock template
                  const publicLockTemplate = await PublicLockLatest.new({
                    from: unlockOwner,
                    gas: constants.MAX_GAS,
                  })
                  PublicLockLatest.setAsDeployed(publicLockTemplate) // for hardhat to be happy

                  await unlock.setLockTemplate(publicLockTemplate.address, {
                    from: unlockOwner,
                    gas: constants.MAX_GAS,
                  })
                })

                it('this version and latest version have different Unlock version numbers', async () => {
                  const version = await unlock.unlockVersion()
                  assert.notEqual(version, versionNumber)
                })

                it('latest version number is correct', async () => {
                  const version = await unlock.unlockVersion()
                  assert.equal(version, UnlockAbis.length)
                })

                it('Key id still set', async () => {
                  const id = await lock.getTokenIdFor(keyOwner)
                  assert.notEqual(id, 0)
                })

                it('Key is still owned', async () => {
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
                  assert.equal(evt.args._to, accounts[8])
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
                      web3.utils.randomHex(12),
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
                    assert.notEqual(version, versionNumber)
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
                    const publicLockVersion = await lockLatest.publicLockVersion()
                    assert.equal(publicLockVersion, PublicLockAbis.length)
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
            web3.utils.padLeft(0, 40),
            [],
            {
              value: keyPrice,
              from: keyOwner,
              gas: constants.MAX_GAS,
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
