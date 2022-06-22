const BigNumber = require('bignumber.js')
const { deployLock, reverts, purchaseKey } = require('../helpers')
const Unlock = artifacts.require('Unlock.sol')

const keyPrice = web3.utils.toWei('0.01', 'ether')

let unlock
let lock

contract('Unlock / resetTrackedValue', (accounts) => {
  beforeEach(async () => {
    lock = await deployLock()
    await purchaseKey(lock, accounts[1])
    unlock = await Unlock.at(await lock.unlockProtocol())
  })

  it('grossNetworkProduct has a non-zero value after a purchase', async () => {
    const grossNetworkProduct = await unlock.grossNetworkProduct()
    assert.equal(grossNetworkProduct, keyPrice)
  })

  it('should fail to resetTrackedValue if called from a non-owner account', async () => {
    await reverts(
      unlock.resetTrackedValue(0, 0, { from: accounts[1] }),
      'ONLY_OWNER'
    )
  })

  describe('resetTrackedValue to 0', async () => {
    beforeEach(async () => {
      await unlock.resetTrackedValue(0, 0, { from: accounts[0] })
    })

    it('grossNetworkProduct is now 0', async () => {
      const grossNetworkProduct = await unlock.grossNetworkProduct()
      assert.equal(grossNetworkProduct, 0)
    })

    describe('After purchase', () => {
      beforeEach(async () => {
        await purchaseKey(lock, accounts[2])
      })

      it('grossNetworkProduct has a non-zero value after a purchase', async () => {
        const grossNetworkProduct = await unlock.grossNetworkProduct()
        assert.equal(grossNetworkProduct, keyPrice)
      })
    })
  })

  describe('resetTrackedValue to 42', async () => {
    beforeEach(async () => {
      await unlock.resetTrackedValue(42, 0, { from: accounts[0] })
    })

    it('grossNetworkProduct is now 42', async () => {
      const grossNetworkProduct = await unlock.grossNetworkProduct()
      assert.equal(grossNetworkProduct, 42)
    })

    describe('After purchase', () => {
      beforeEach(async () => {
        await purchaseKey(lock, accounts[2])
      })

      it('grossNetworkProduct has a non-zero value after a purchase', async () => {
        const grossNetworkProduct = await unlock.grossNetworkProduct()
        assert.equal(
          grossNetworkProduct,
          new BigNumber(keyPrice).plus(42).toFixed()
        )
      })
    })
  })
})
