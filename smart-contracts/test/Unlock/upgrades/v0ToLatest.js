const Units = require('ethereumjs-units')
const Web3Utils = require('web3-utils')
const { TestHelper } = require('@openzeppelin/cli')
const BigNumber = require('bignumber.js')
const { ZWeb3, Contracts } = require('@openzeppelin/upgrades')

ZWeb3.initialize(web3.currentProvider)
const UnlockV0 = Contracts.getFromNodeModules('unlock-abi-0', '../../Unlock')
const PublicLockV0 = require('unlock-abi-0/PublicLock')

const UnlockLatest = Contracts.getFromLocal('Unlock')
const PublicLockLatest = Contracts.getFromLocal('PublicLock')
const { LatestUnlockVersion, LatestLockVersion } = require('./latestVersion.js')

let project, proxy, unlock

contract('Unlock / upgrades / v0ToLatest', accounts => {
  const unlockOwner = accounts[9]
  const lockOwner = accounts[1]
  const keyOwner = accounts[2]
  const keyPrice = Units.convert('0.01', 'eth', 'wei')
  let lockV0
  let v0LockData

  before(async () => {
    project = await TestHelper({ from: unlockOwner })

    // Deploy
    UnlockV0.schema.contractName = 'UnlockV0'
    proxy = await project.createProxy(UnlockV0, {
      UnlockV0,
      initMethod: 'initialize',
      initArgs: [unlockOwner],
    })

    unlock = await UnlockV0.at(proxy.address)

    // Create Lock
    const lockTx = await unlock.methods
      .createLock(
        60 * 60 * 24, // expirationDuration 1 day
        keyPrice,
        5 // maxNumberOfKeys
      )
      .send({ from: lockOwner, gas: 6000000 })
    // THIS API IS LIKELY TO BREAK BECAUSE IT ASSUMES SO MUCH
    const evt = lockTx.events.NewLock
    lockV0 = new web3.eth.Contract(
      PublicLockV0.abi,
      evt.returnValues.newLockAddress
    )

    // Buy Key
    await lockV0.methods.purchaseFor(keyOwner, Web3Utils.toHex('Julien')).send({
      value: keyPrice,
      from: keyOwner,
      gas: 4000000,
    })

    // Record sample lock data
    v0LockData = await unlock.methods.locks(lockV0._address).call()
  })

  it('Unlock has an owner', async () => {
    const owner = await unlock.methods.owner().call()
    assert.equal(owner, unlockOwner)
  })

  it('v0 Key is owned', async () => {
    const id = await lockV0.methods.getTokenIdFor(keyOwner).call()
    assert.equal(Web3Utils.toChecksumAddress(Web3Utils.toHex(id)), keyOwner)
  })

  it('the versions V0 and latest version have different bytecode', async () => {
    assert.notEqual(UnlockLatest.schema.bytecode, UnlockV0.schema.bytecode)
  })

  describe('latest', () => {
    before(async () => {
      await project.upgradeProxy(proxy.address, UnlockLatest)
      unlock = await UnlockLatest.at(proxy.address)
      const lock = await PublicLockLatest.new({
        from: unlockOwner,
        gas: 6700000,
      })
      await unlock.methods
        .configUnlock(
          lock.address,
          await unlock.methods.globalTokenSymbol().call(),
          await unlock.methods.globalBaseTokenURI().call()
        )
        .send({
          from: unlockOwner,
        })
    })

    describe('Lock created with UnlockV0 is still available', () => {
      it('v0 Key is still owned', async () => {
        const id = await lockV0.methods.getTokenIdFor(keyOwner).call()
        assert.equal(Web3Utils.toChecksumAddress(Web3Utils.toHex(id)), keyOwner)
      })

      /**
       * v0 Locks are NO LONGER SUPPORTED.
       * Attempting to purchase a key will fail.
       * This is due to Unlock.sol calling PublicLock before the version was available.
       * Other functions, such as withdraw, should be fine.
       */
      it.skip('New keys may still be purchased', async () => {
        const tx = await lockV0.methods
          .purchaseFor(accounts[6], Web3Utils.toHex('Julien'))
          .send({
            value: keyPrice,
            from: accounts[6],
            gas: 4000000,
          })
        assert.equal(tx.events.Transfer.event, 'Transfer')
      })

      it.skip('Keys may still be transfered', async () => {
        await lockV0.methods
          .purchaseFor(accounts[7], Web3Utils.toHex('Julien'))
          .send({
            value: keyPrice,
            from: accounts[7],
            gas: 4000000,
          })
        const tx = await lockV0.methods
          .transferFrom(
            accounts[7],
            accounts[8],
            await lockV0.methods.getTokenIdFor(accounts[7]).call()
          )
          .send({
            from: accounts[7],
            gas: 4000000,
          })
        assert.equal(tx.events.Transfer.event, 'Transfer')
      })

      it('grossNetworkProduct remains', async () => {
        const grossNetworkProduct = new BigNumber(
          await unlock.methods.grossNetworkProduct().call()
        )
        assert.equal(
          grossNetworkProduct.toFixed(),
          new BigNumber(keyPrice).times(1).toFixed()
        )
      })

      it('lock data should persist state between upgrades', async function() {
        const resultsAfter = await unlock.methods.locks(lockV0._address).call()
        assert.equal(resultsAfter.deployed, v0LockData.deployed)
        assert.equal(
          resultsAfter.yieldedDiscountTokens,
          v0LockData.yieldedDiscountTokens
        )
      })
    })

    describe('Using latest version after an upgrade', () => {
      let lockLatest

      before(async () => {
        // Create a new Lock
        const lockTx = await unlock.methods
          .createLock(
            60 * 60 * 24, // expirationDuration 1 day
            Web3Utils.padLeft(0, 40),
            keyPrice,
            5, // maxNumberOfKeys
            'After-Upgrade Lock',
            '0x000000000000000000000000'
          )
          .send({
            from: lockOwner,
            gas: 6000000,
          })
        // THIS API IS LIKELY TO BREAK BECAUSE IT ASSUMES SO MUCH
        const evt = lockTx.events.NewLock
        lockLatest = await PublicLockLatest.at(evt.returnValues.newLockAddress)

        // Buy Key
        await lockLatest.methods
          .purchase(0, keyOwner, web3.utils.padLeft(0, 40), [])
          .send({
            value: keyPrice,
            from: keyOwner,
            gas: 4000000,
          })
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
        const id = new BigNumber(
          await lockLatest.methods.getTokenIdFor(keyOwner).call()
        )
        assert.equal(id.toFixed(), 1)
      })

      it('v0 Key is still owned', async () => {
        const id = await lockV0.methods.getTokenIdFor(keyOwner).call()
        assert.equal(Web3Utils.toChecksumAddress(Web3Utils.toHex(id)), keyOwner)
      })

      it('Latest Unlock version is correct', async () => {
        const unlockVersion = await unlock.methods.unlockVersion().call()
        assert.equal(unlockVersion, LatestUnlockVersion)
      })

      it('Latest publicLock version is correct', async () => {
        const publicLockVersion = await lockLatest.methods
          .publicLockVersion()
          .call()
        assert.equal(publicLockVersion, LatestLockVersion)
      })
    })
  })
})
