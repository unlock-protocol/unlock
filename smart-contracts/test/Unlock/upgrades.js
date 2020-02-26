const BigNumber = require('bignumber.js')
const { TestHelper } = require('@openzeppelin/cli')
const { ZWeb3, Contracts } = require('@openzeppelin/upgrades')
const { constants } = require('hardlydifficult-ethereum-contracts')

ZWeb3.initialize(web3.currentProvider)
const UnlockAbis = [
  Contracts.getFromNodeModules('unlock-abi-0', '../../Unlock'), // 0
  Contracts.getFromNodeModules('unlock-abi-0-1', '../../Unlock'), // 1
  Contracts.getFromNodeModules('unlock-abi-0-2', '../../Unlock'), // 2
  Contracts.getFromNodeModules('unlock-abi-1-0', '../../Unlock'), // 3
  Contracts.getFromNodeModules('unlock-abi-1-1', '../../Unlock'), // 4
  Contracts.getFromNodeModules('unlock-abi-1-2', '../../Unlock'), // 5
  Contracts.getFromNodeModules('unlock-abi-1-3', '../../Unlock'), // 6
]
const PublicLockAbis = [
  // eslint-disable-next-line global-require
  require('unlock-abi-0/PublicLock'), // 0
  // eslint-disable-next-line global-require
  require('unlock-abi-0-1/PublicLock'), // 1
  // eslint-disable-next-line global-require
  require('unlock-abi-0-2/PublicLock'), // 2
  // eslint-disable-next-line global-require
  require('unlock-abi-1-0/PublicLock'), // 3
  // eslint-disable-next-line global-require
  require('unlock-abi-1-1/PublicLock'), // 4
  // eslint-disable-next-line global-require
  require('unlock-abi-1-2/PublicLock'), // 5
  // eslint-disable-next-line global-require
  require('unlock-abi-1-3/PublicLock'), // 6
]

const UnlockLatest = Contracts.getFromLocal('Unlock')
const PublicLockLatest = Contracts.getFromLocal('PublicLock')

let project
let proxy
let unlock

contract('Unlock / upgrades', accounts => {
  const unlockOwner = accounts[9]
  const lockOwner = accounts[1]
  const keyOwner = accounts[2]
  const keyPrice = web3.utils.toWei('0.01', 'ether')

  for (
    let versionNumber = 0;
    versionNumber < UnlockAbis.length;
    versionNumber++
  ) {
    describe(`Testing version ${versionNumber}`, () => {
      let unlockAbi
      let originalLockData

      beforeEach(async () => {
        project = await TestHelper({ from: unlockOwner })

        // Deploy the Unlock proxy
        unlockAbi = UnlockAbis[versionNumber]
        // A unique name is required for the OZ test helper to work
        unlockAbi.schema.contractName = `UnlockV${versionNumber}`
        proxy = await project.createProxy(unlockAbi, {
          initMethod: 'initialize',
          initArgs: [unlockOwner],
        })
        unlock = await unlockAbi.at(proxy.address)
      })

      it('Unlock version is set', async () => {
        if (versionNumber >= 2) {
          // Version numbers were introduced to Unlock with v2
          const version = await unlock.methods.unlockVersion().call()
          assert.equal(version, versionNumber)
        }
      })

      it('this version and latest version have different Unlock bytecode', async () => {
        assert.notEqual(UnlockLatest.schema.bytecode, unlockAbi.schema.bytecode)
      })

      it('Unlock has an owner', async () => {
        const owner = await unlock.methods.owner().call()
        assert.equal(owner, unlockOwner)
      })

      describe('Complete configuration if require', () => {
        let publicLockAbi

        beforeEach(async () => {
          publicLockAbi = PublicLockAbis[versionNumber]

          if (versionNumber >= 5) {
            // The lock minimal proxy was introduced with version 5
            const lockTemplate = await new web3.eth.Contract(publicLockAbi.abi)
              .deploy({
                data: publicLockAbi.bytecode,
              })
              .send({
                from: unlockOwner,
                // Gas is not automatically estimated, using max to simplify the test
                gas: constants.MAX_GAS,
              })

            if (versionNumber >= 7) {
              // Version 7 moved setLockTemplate to its own function
              await unlock.methods.setLockTemplate(lockTemplate._address).send({
                from: unlockOwner,
                gas: constants.MAX_GAS,
              })
            } else {
              await unlock.methods
                .configUnlock(lockTemplate._address, '', '')
                .send({
                  from: unlockOwner,
                  gas: constants.MAX_GAS,
                })
            }
          }
        })

        it('this version and latest version have different PublicLock bytecode', async () => {
          assert.notEqual(
            PublicLockLatest.schema.bytecode,
            publicLockAbi.bytecode
          )
        })

        describe('Create a lock for testing', () => {
          let lock

          beforeEach(async () => {
            // Create Lock
            let lockTx
            if (versionNumber >= 5) {
              // Version 5 introduced `create2`, requiring a salt
              lockTx = await unlock.methods
                .createLock(
                  60 * 60 * 24, // expirationDuration 1 day
                  web3.utils.padLeft(0, 40), // token address
                  keyPrice,
                  5, // maxNumberOfKeys
                  'UpgradeTestingLock',
                  web3.utils.randomHex(12)
                )
                .send({
                  from: lockOwner,
                  gas: constants.MAX_GAS,
                })
            } else if (versionNumber >= 3) {
              // Version 3 added a lock name
              lockTx = await unlock.methods
                .createLock(
                  60 * 60 * 24, // expirationDuration 1 day
                  web3.utils.padLeft(0, 40), // token address
                  keyPrice,
                  5, // maxNumberOfKeys
                  'UpgradeTestingLock'
                )
                .send({
                  from: lockOwner,
                  gas: constants.MAX_GAS,
                })
            } else if (versionNumber >= 1) {
              // Version 1 added ERC-20 support, requiring a tokenAddress
              lockTx = await unlock.methods
                .createLock(
                  60 * 60 * 24, // expirationDuration 1 day
                  web3.utils.padLeft(0, 40), // token address
                  keyPrice,
                  5 // maxNumberOfKeys
                )
                .send({
                  from: lockOwner,
                  gas: constants.MAX_GAS,
                })
            } else {
              lockTx = await unlock.methods
                .createLock(
                  60 * 60 * 24, // expirationDuration 1 day
                  keyPrice,
                  5 // maxNumberOfKeys
                )
                .send({
                  from: lockOwner,
                  gas: constants.MAX_GAS,
                })
            }

            const evt = lockTx.events.NewLock
            lock = await new web3.eth.Contract(
              publicLockAbi.abi,
              evt.returnValues.newLockAddress
            )
          })

          it('PublicLock version is set', async () => {
            if (versionNumber >= 1) {
              // Version numbers were introduced to PublicLock with v1
              const version = await lock.methods.publicLockVersion().call()
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
              await purchaseKey(lock, keyOwner)

              // Record sample lock data
              originalLockData = await unlock.methods
                .locks(lock._address)
                .call()
            })

            it('Key has an ID', async () => {
              const id = await lock.methods.getTokenIdFor(keyOwner).call()
              assert.notEqual(id, 0)
            })

            it('Key is owned', async () => {
              if (versionNumber >= 1) {
                // isKeyOwner was introduced in v1
                const id = await lock.methods.getTokenIdFor(keyOwner).call()
                const isOwned = await lock.methods
                  .isKeyOwner(id, keyOwner)
                  .call()
                assert.equal(isOwned, true)
              }
            })

            describe('Upgrade Unlock to latest version', () => {
              beforeEach(async () => {
                await project.upgradeProxy(proxy.address, UnlockLatest)
                unlock = await UnlockLatest.at(proxy.address)

                const lockTemplate = await PublicLockLatest.new({
                  from: unlockOwner,
                  gas: constants.MAX_GAS,
                })
                await unlock.methods
                  .setLockTemplate(lockTemplate.address)
                  .send({
                    from: unlockOwner,
                    gas: constants.MAX_GAS,
                  })
              })

              it('this version and latest version have different Unlock version numbers', async () => {
                const version = await unlock.methods.unlockVersion().call()
                assert.notEqual(version, versionNumber)
              })

              it('latest version number is correct', async () => {
                const version = await unlock.methods.unlockVersion().call()
                assert.equal(version, UnlockAbis.length)
              })

              it('Key id still set', async () => {
                const id = await lock.methods.getTokenIdFor(keyOwner).call()
                assert.notEqual(id, 0)
              })

              it('Key is still owned', async () => {
                const id = await lock.methods.getTokenIdFor(keyOwner).call()
                if (versionNumber >= 1) {
                  // isKeyOwner was introduced in v1
                  const bool = await lock.methods
                    .isKeyOwner(id, keyOwner)
                    .call()
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
                const tx = await lock.methods
                  .transferFrom(
                    keyOwner,
                    accounts[8],
                    await lock.methods.getTokenIdFor(keyOwner).call()
                  )
                  .send({
                    from: keyOwner,
                    gas: constants.MAX_GAS,
                  })
                assert.equal(tx.events.Transfer.event, 'Transfer')
              })

              it('grossNetworkProduct remains', async () => {
                const grossNetworkProduct = new BigNumber(
                  await unlock.methods.grossNetworkProduct().call()
                )
                assert.equal(
                  grossNetworkProduct.toFixed(),
                  new BigNumber(keyPrice).toFixed()
                )
              })

              it('lock data should persist state between upgrades', async () => {
                const resultsAfter = await unlock.methods
                  .locks(lock._address)
                  .call()
                assert.equal(resultsAfter.deployed, originalLockData.deployed)
                assert.equal(
                  resultsAfter.yieldedDiscountTokens,
                  originalLockData.yieldedDiscountTokens
                )
              })

              it('tokenURI still works as expected', async () => {
                if (versionNumber >= 3) {
                  // tokenURI was introduced with v3
                  await lock.methods.tokenURI(1).call()
                }
              })

              describe('Using latest version after an upgrade', () => {
                let lockLatest

                beforeEach(async () => {
                  // Create a new Lock
                  const lockTx = await unlock.methods
                    .createLock(
                      60 * 60 * 24, // expirationDuration 1 day
                      web3.utils.padLeft(0, 40),
                      keyPrice,
                      5, // maxNumberOfKeys
                      'After-Upgrade Lock',
                      web3.utils.randomHex(12)
                    )
                    .send({
                      from: lockOwner,
                      gas: constants.MAX_GAS,
                    })

                  const evt = lockTx.events.NewLock
                  lockLatest = await PublicLockLatest.at(
                    evt.returnValues.newLockAddress
                  )

                  // Buy Key
                  await lockLatest.methods
                    .purchase(0, keyOwner, web3.utils.padLeft(0, 40), [])
                    .send({
                      value: keyPrice,
                      from: keyOwner,
                      gas: constants.MAX_GAS,
                    })
                })

                it('this version and latest version have different PublicLock version numbers', async () => {
                  const version = await lockLatest.methods
                    .publicLockVersion()
                    .call()
                  assert.notEqual(version, versionNumber)
                })

                it('grossNetworkProduct sums previous version purchases with new version purchases', async () => {
                  const grossNetworkProduct = new BigNumber(
                    await unlock.methods.grossNetworkProduct().call()
                  )
                  assert.equal(
                    grossNetworkProduct.toFixed(),
                    new BigNumber(keyPrice).times(2).toFixed()
                  )
                })

                it('Latest Key is owned', async () => {
                  const id = await lockLatest.methods
                    .getTokenIdFor(keyOwner)
                    .call()
                  const isOwned = await lockLatest.methods
                    .isKeyOwner(id, keyOwner)
                    .call()
                  assert.equal(isOwned, true)
                })

                it('Latest publicLock version is correct', async () => {
                  const publicLockVersion = await lockLatest.methods
                    .publicLockVersion()
                    .call()
                  assert.equal(publicLockVersion, UnlockAbis.length)
                })
              })
            })
          })
        })
      })

      async function purchaseKey(lock) {
        if (versionNumber >= 5) {
          // Version 5 renamed to purchase, added keyPrice, referrer, and data
          return await lock.methods
            .purchase(0, keyOwner, web3.utils.padLeft(0, 40), [])
            .send({
              value: keyPrice,
              from: keyOwner,
              gas: constants.MAX_GAS,
            })
        }
        if (versionNumber >= 1) {
          // Version 1 removed the keyData field
          return await lock.methods.purchaseFor(keyOwner).send({
            value: keyPrice,
            from: keyOwner,
            gas: constants.MAX_GAS,
          })
        }
        return await lock.methods
          .purchaseFor(keyOwner, web3.utils.toHex('Julien'))
          .send({
            value: keyPrice,
            from: keyOwner,
            gas: constants.MAX_GAS,
          })
      }
    })
  }
})
