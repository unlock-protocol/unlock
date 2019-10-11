const Units = require('ethereumjs-units')
const Web3Utils = require('web3-utils')
const { TestHelper } = require('@openzeppelin/cli')
const BigNumber = require('bignumber.js')
const { ZWeb3, Contracts } = require('@openzeppelin/upgrades')

ZWeb3.initialize(web3.currentProvider)
const UnlockV1 = Contracts.getFromNodeModules('unlock-abi-0-1', '../../Unlock')
const PublicLockV1 = require('unlock-abi-0-1/PublicLock')

const UnlockLatest = Contracts.getFromLocal('Unlock')
const PublicLockLatest = Contracts.getFromLocal('PublicLock')
const { LatestUnlockVersion, LatestLockVersion } = require('./latestVersion.js')

let project, proxy, unlock

contract('Unlock / upgrades', accounts => {
  const unlockOwner = accounts[9]
  const lockOwner = accounts[1]
  const keyOwner = accounts[2]
  const keyPrice = Units.convert('0.01', 'eth', 'wei')
  let lockV1
  let V1LockData

  before(async () => {
    project = await TestHelper({ from: unlockOwner })

    // Deploy
    UnlockV1.schema.contractName = 'UnlockV1'
    proxy = await project.createProxy(UnlockV1, {
      UnlockV1,
      initMethod: 'initialize',
      initArgs: [unlockOwner],
    })

    unlock = await UnlockV1.at(proxy.address)

    // Create Lock
    const lockTx = await unlock.methods
      .createLock(
        60 * 60 * 24, // expirationDuration 1 day
        Web3Utils.padLeft(0, 40), // token address
        keyPrice,
        5 // maxNumberOfKeys
      )
      .send({ from: lockOwner, gas: 6000000 })
    // THIS API IS LIKELY TO BREAK BECAUSE IT ASSUMES SO MUCH
    const evt = lockTx.events.NewLock
    lockV1 = new web3.eth.Contract(
      PublicLockV1.abi,
      evt.returnValues.newLockAddress
    )

    // Buy Key
    await lockV1.methods.purchaseFor(keyOwner).send({
      value: keyPrice,
      from: keyOwner,
      gas: 4000000,
    })

    // Record sample lock data
    V1LockData = await unlock.methods.locks(lockV1._address).call()
  })

  it('Unlock has an owner', async () => {
    const owner = await unlock.methods.owner().call()
    assert.equal(owner, unlockOwner)
  })

  it('V1 Key is owned', async () => {
    const id = await lockV1.methods.getTokenIdFor(keyOwner).call()
    const bool = await lockV1.methods.isKeyOwner(id, keyOwner).call()
    assert.equal(bool, true)
  })

  it('the versions V1 and latest version have different bytecode', async () => {
    assert.notEqual(UnlockLatest.schema.bytecode, UnlockV1.schema.bytecode)
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

    describe('Lock created with UnlockV1 is still available', () => {
      it('V1 Key is still owned', async () => {
        const id = await lockV1.methods.getTokenIdFor(keyOwner).call()
        const bool = await lockV1.methods.isKeyOwner(id, keyOwner).call()
        assert.equal(bool, true)
      })

      it('New keys may still be purchased', async () => {
        const tx = await lockV1.methods.purchaseFor(accounts[6]).send({
          value: keyPrice,
          from: accounts[6],
          gas: 4000000,
        })
        assert.equal(tx.events.Transfer.event, 'Transfer')
      })

      it('Keys may still be transfered', async () => {
        await lockV1.methods.purchaseFor(accounts[7]).send({
          value: keyPrice,
          from: accounts[7],
          gas: 4000000,
        })
        const tx = await lockV1.methods
          .transferFrom(
            accounts[7],
            accounts[8],
            await lockV1.methods.getTokenIdFor(accounts[7]).call()
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
          new BigNumber(keyPrice).times(3).toFixed()
        )
      })

      it('lock data should persist state between upgrades', async function() {
        const resultsAfter = await unlock.methods.locks(lockV1._address).call()
        assert.equal(resultsAfter.deployed, V1LockData.deployed)
        assert.equal(
          resultsAfter.yieldedDiscountTokens,
          V1LockData.yieldedDiscountTokens
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
            'After-Upgrade Lock'
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
          new BigNumber(keyPrice).times(4).toFixed()
        )
      })

      it('Latest Key is owned', async () => {
        const id = new BigNumber(
          await lockLatest.methods.getTokenIdFor(keyOwner).call()
        )
        assert.equal(id.toFixed(), 1)
      })

      it('V1 Key is still owned', async () => {
        const id = await lockV1.methods.getTokenIdFor(keyOwner).call()
        const bool = await lockV1.methods.isKeyOwner(id, keyOwner).call()
        assert.equal(bool, true)
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
