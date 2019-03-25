const Units = require('ethereumjs-units')
const Web3Utils = require('web3-utils')
const { TestHelper } = require('zos')
const BigNumber = require('bignumber.js')
const { ZWeb3, Contracts } = require('zos-lib')
ZWeb3.initialize(web3.currentProvider)
// Path is relative to `build/contracts/` directory
const UnlockV0 = Contracts.getFromLocal(
  '../../node_modules/unlock-abi-0/Unlock'
)
const PublicLockV0 = require('public-lock-abi-0/abi_V0')
const UnlockV1 = Contracts.getFromLocal('Unlock')
const PublicLockV1 = Contracts.getFromLocal('PublicLock')

let project, proxy, unlock

contract('Unlock / upgrades', accounts => {
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
      .send({ from: lockOwner, gas: 4000000 })
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

  it('v0 Key is owned', async () => {
    const id = await lockV0.methods.getTokenIdFor(keyOwner).call()
    assert.equal(Web3Utils.toChecksumAddress(Web3Utils.toHex(id)), keyOwner)
  })

  it('the versions V0 and V1 have different bytecode', async () => {
    assert.notEqual(UnlockV1.schema.bytecode, UnlockV0.schema.bytecode)
  })

  describe('v1', () => {
    before(async () => {
      project.upgradeProxy(proxy.address, UnlockV1)
      unlock = UnlockV1.at(proxy.address)
    })

    describe('Lock created with UnlockV0 is still available', () => {
      it('v0 Key is still owned', async () => {
        const id = await lockV0.methods.getTokenIdFor(keyOwner).call()
        assert.equal(Web3Utils.toChecksumAddress(Web3Utils.toHex(id)), keyOwner)
      })

      it('New keys may still be purchased', async () => {
        const tx = await lockV0.methods
          .purchaseFor(accounts[6], Web3Utils.toHex('Julien'))
          .send({
            value: keyPrice,
            from: accounts[6],
            gas: 4000000,
          })
        assert.equal(tx.events.Transfer.event, 'Transfer')
      })

      it('Keys may still be transfered', async () => {
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
          new BigNumber(keyPrice).times(3).toFixed()
        )
      })

      it('lock data should persist state between upgrades', async function() {
        const resultsAfter = await unlock.methods.locks(lockV0._address).call()
        assert.equal(JSON.stringify(resultsAfter), JSON.stringify(v0LockData))
      })
    })

    describe('Using v1 after an upgrade', () => {
      let lockV1

      before(async () => {
        // Create a new Lock
        const lockTx = await unlock.methods
          .createLock(
            60 * 60 * 24, // expirationDuration 1 day
            Web3Utils.padLeft(0, 40),
            keyPrice,
            5 // maxNumberOfKeys
          )
          .send({
            from: lockOwner,
            gas: 4000000,
          })
        // THIS API IS LIKELY TO BREAK BECAUSE IT ASSUMES SO MUCH
        const evt = lockTx.events.NewLock
        lockV1 = await PublicLockV1.at(evt.returnValues.newLockAddress)

        // Buy Key
        await lockV1.methods.purchaseFor(keyOwner).send({
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

      it('v1 Key is owned', async () => {
        const id = new BigNumber(
          await lockV1.methods.getTokenIdFor(keyOwner).call()
        )
        assert.equal(id.toFixed(), 1)
      })

      it('v0 Key is still owned', async () => {
        const id = await lockV0.methods.getTokenIdFor(keyOwner).call()
        assert.equal(Web3Utils.toChecksumAddress(Web3Utils.toHex(id)), keyOwner)
      })
    })
  })
})
