const BigNumber = require('bignumber.js')
const { constants } = require('hardlydifficult-ethereum-contracts')
// const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades');

const { deployments } = require('hardhat')
const { getArtifact } = deployments

const UnlockAbis = [
  artifacts.require('@unlock-protocol/unlock-abi-0/Unlock'), // 0
  artifacts.require('@unlock-protocol/unlock-abi-1/Unlock'), // 1
  artifacts.require('@unlock-protocol/unlock-abi-2/Unlock'), // 2
  artifacts.require('@unlock-protocol/unlock-abi-3/Unlock'), // 3
  artifacts.require('@unlock-protocol/unlock-abi-4/Unlock'), // 4
  artifacts.require('@unlock-protocol/unlock-abi-5/Unlock'), // 5
  artifacts.require('@unlock-protocol/unlock-abi-6/Unlock'), // 6
  artifacts.require('@unlock-protocol/unlock-abi-7/Unlock'), // 7
  artifacts.require('@unlock-protocol/unlock-abi-8/Unlock'), // 8
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

contract('Unlock / upgrades', (accounts) => {
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

      before(async () => {

        unlockAbi = UnlockAbis[versionNumber]
        const abi = Object.assign({}, { contractName: `UnlockV${versionNumber}`, }, unlockAbi.toJSON())
        
        console.log(abi.abi.map(d=> d.name))
        proxy = await deployments.deploy(`UnlockProxied`, {
          contract: abi,
          from: unlockOwner,
          skipIfAlreadyDeployed: false,
          log: true,
          proxy: {
            owner: unlockOwner,
            proxyContract: 'OpenZeppelinTransparentProxy',
            execute: {
              init: {
                methodName: "initialize",
                args: [unlockOwner]
              }
            }
          }
        })

        // make sure it is deployed at another address
        const unlockDeployed = await deployments.get('Unlock')
        console.log(unlockDeployed.address, proxy.address)
        
        // implementations are also different
        console.log(unlockDeployed.implementation, proxy.implementation)

        // pass contract deployed w hardat to truffle
        unlock = await unlockAbi.at(proxy.address)
        unlockAbi.setAsDeployed(unlock)

        // always shows v9 methods
        console.log(versionNumber, await unlock.unlockVersion(), Object.keys(unlock.methods))
      })

      it('Unlock version is set', async () => {
        if (versionNumber >= 2) {
          // Version numbers were introduced to Unlock with v2
          const version = await unlock.unlockVersion()
          assert.equal(version, versionNumber)
        }
      })

      it('this version and latest version have different Unlock bytecode', async () => {
        const UnlockLatestAbi = await getArtifact('Unlock')
        assert.notEqual(UnlockLatestAbi.bytecode, unlockAbi.bytecode)
      })

      it('Unlock has an owner', async () => {
        const owner = await unlock.owner()
        assert.equal(owner, unlockOwner)
      })

      if (PublicLockAbis && PublicLockAbis[versionNumber]) {
        describe('Complete PublicLock configuration if require', () => {
          let publicLockAbi

          beforeEach(async () => {
            publicLockAbi = PublicLockAbis[versionNumber]
            PublicLockLatest = await getArtifact('PublicLock')

            if (versionNumber >= 5) {
              // The lock minimal proxy was introduced with version 5
              const lockTemplate = await new web3.eth.Contract(
                publicLockAbi.abi
              )
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
                await unlock
                  .setLockTemplate(
                    lockTemplate._address,{
                      from: unlockOwner,
                      gas: constants.MAX_GAS,
                    })
              } else {
                await unlock
                  .configUnlock(
                    lockTemplate._address, 
                    '', 
                    '',
                    {
                      from: unlockOwner,
                      gas: constants.MAX_GAS,
                    })
              }
            }
          })

          it('this version and latest version have different PublicLock bytecode', async () => {
            const PublicLockLatest = await getArtifact('PublicLock')
            assert.notEqual(
              PublicLockLatest.bytecode,
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
                lockTx = await unlock
                  .createLock(
                    60 * 60 * 24, // expirationDuration 1 day
                    web3.utils.padLeft(0, 40), // token address
                    keyPrice,
                    5, // maxNumberOfKeys
                    'UpgradeTestingLock',
                    web3.utils.randomHex(12), 
                    {
                      from: lockOwner,
                      gas: constants.MAX_GAS,
                    })
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
                    })
              } else if (versionNumber >= 1) {
                // Version 1 added ERC-20 support, requiring a tokenAddress
                lockTx = await unlock
                  .createLock(
                    60 * 60 * 24, // expirationDuration 1 day
                    web3.utils.padLeft(0, 40), // token address
                    keyPrice,
                    5, // maxNumberOfKeys
                    {
                      from: lockOwner,
                      gas: constants.MAX_GAS,
                    })
              } else {
                console.log(versionNumber, Object.keys(unlock.methods))
                // console.log(await unlock.unlockVersion())
                lockTx = await unlock
                  .createLock(
                    60 * 60 * 24, // expirationDuration 1 day
                    keyPrice,
                    5, // maxNumberOfKeys
                    {
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
                await purchaseKey(lock, keyOwner)

                // Record sample lock data
                originalLockData = await unlock.locks(lock._address)
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

                  // const Box = artifacts.require('Box');
                  // const BoxV2 = artifacts.require('BoxV2');

                  // const UnlockLatest = artifacts.require("Unlock");
                  
                  // const proxy = await deploy('Unlock', {
                  //   from: unlockOwner,
                  //   log: true,
                  //   args: [unlockOwner], // args
                  //   proxy: {
                  //     methodName: 'initialize', // methodName
                  //     owner: unlockOwner,
                  //     proxyContract: 'OpenZeppelinTransparentProxy',
                  //   }
                  // })
                  
                  // // get latest version deployed on hardhat
                  // unlock = await UnlockLatest.at(proxy.address)

                  // console.log(await unlock.methods.unlockVersion().call())

                  // get template
                  // const lockTemplate = await get('PublicLock')

                  // console.log(unlock)
                  // await unlock.setLockTemplate(lockTemplate.address)
                  //   .send({
                  //     from: unlockOwner,
                  //     gas: constants.MAX_GAS,
                  //   })
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
