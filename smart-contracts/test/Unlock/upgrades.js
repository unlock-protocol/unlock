const Units = require('ethereumjs-units')
const PublicLockV1 = artifacts.require('PublicLock.sol')
const Web3Utils = require('web3-utils')
const { TestHelper } = require('zos')
const BigNumber = require('bignumber.js')
const { ZWeb3, Contracts } = require('zos-lib')
ZWeb3.initialize(web3.currentProvider)
const UnlockV0 = Contracts.getFromLocal('../../../versions/Unlock_V0')
const PublicLockV0 = require('../../published-npm-modules/V0/abi_V0.json')
const UnlockV1 = Contracts.getFromLocal('Unlock')

let project, proxy, unlock

contract('Unlock', accounts => {
  const unlockOwner = accounts[9]
  const lockOwner = accounts[1]
  const keyOwner = accounts[2]
  const keyPrice = Units.convert('0.01', 'eth', 'wei')

  before(async () => {
    project = await TestHelper({ from: unlockOwner })
  })

  describe('Upgrade from v0 to v1', () => {
    let lockV0
    let v0LockData

    before(async () => {
      // Deploy
      proxy = await project.createProxy(UnlockV0, {
        UnlockV0,
        initMethod: 'initialize',
        initArgs: [unlockOwner]
      })

      unlock = await UnlockV0.at(proxy.address)

      // Create Lock
      const lockTx = await unlock.methods.createLock(
        60 * 60 * 24, // expirationDuration 1 day
        keyPrice,
        5 // maxNumberOfKeys
      ).send(
        { from: lockOwner, gas: 4000000 }
      )
      // THIS API IS LIKELY TO BREAK BECAUSE IT ASSUMES SO MUCH
      const evt = lockTx.events.NewLock
      lockV0 = await web3.eth.contract(PublicLockV0.abi).at(evt.returnValues.newLockAddress)

      // Buy Key
      await lockV0.purchaseFor(keyOwner, Web3Utils.toHex('Julien'), {
        value: keyPrice,
        from: keyOwner,
        gas: 4000000
      })

      // Record sample lock data
      v0LockData = await unlock.methods.locks(lockV0.address).call()
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
          const id = await lockV0.getTokenIdFor.call(keyOwner)
          assert.equal(id, 1)
        })

        it('New keys may still be purchased', async () => {
          const tx = await lockV0.purchaseFor(accounts[6], Web3Utils.toHex('Julien'), {
            value: keyPrice,
            from: accounts[6],
            gas: 4000000
          })
          const txReceipt = await web3.eth.getTransactionReceipt(tx)
          assert.equal(txReceipt.logs.length, 1)
        })

        it('Keys may still be transfered', async () => {
          await lockV0.purchaseFor(accounts[7], Web3Utils.toHex('Julien'), {
            value: keyPrice,
            from: accounts[7],
            gas: 4000000
          })
          const tx = await lockV0.transferFrom(accounts[7], accounts[8], await lockV0.getTokenIdFor.call(accounts[7]), {
            from: accounts[7],
            gas: 4000000
          })
          const txReceipt = await web3.eth.getTransactionReceipt(tx)
          assert.equal(txReceipt.logs.length, 1)
        })

        it('grossNetworkProduct remains', async () => {
          const grossNetworkProduct = new BigNumber(await unlock.methods.grossNetworkProduct().call())
          assert.equal(grossNetworkProduct.toFixed(), new BigNumber(keyPrice).times(3).toFixed())
        })

        it('lock data should persist state between upgrades', async function () {
          const resultsAfter = await unlock.methods.locks(lockV0.address).call()
          assert.equal(JSON.stringify(resultsAfter), JSON.stringify(v0LockData))
        })
      })

      describe('Using v1 after an upgrade', () => {
        let lockV1

        before(async () => {
          // Create a new Lock
          const lockTx = await unlock.methods.createLock(
            60 * 60 * 24, // expirationDuration 1 day
            keyPrice,
            5 // maxNumberOfKeys
          ).send(
            {
              from: lockOwner,
              gas: 4000000
            }
          )
          // THIS API IS LIKELY TO BREAK BECAUSE IT ASSUMES SO MUCH
          const evt = lockTx.events.NewLock
          lockV1 = await PublicLockV1.at(evt.returnValues.newLockAddress)

          // Buy Key
          await lockV1.purchaseFor(keyOwner, Web3Utils.toHex('Julien'), {
            value: keyPrice,
            from: keyOwner
          })
        })

        it('grossNetworkProduct sums previous version purchases with new version purchases', async () => {
          const grossNetworkProduct = new BigNumber(await unlock.methods.grossNetworkProduct().call())
          assert.equal(grossNetworkProduct.toFixed(), new BigNumber(keyPrice).times(4))
        })

        it('v1 Key is owned', async () => {
          const id = await lockV1.getTokenIdFor(keyOwner)
          assert.equal(id, 1)
        })

        it('v0 Key is still owned', async () => {
          const id = await lockV0.getTokenIdFor(keyOwner)
          assert.equal(id, 1)
        })
      })
    })
  })
})
