const {
  deployContracts,
  deployLock,
  reverts,
  purchaseKey,
  compareBigNumbers,
} = require('../helpers')
const { ethers } = require('hardhat')

const keyPrice = ethers.utils.parseUnits('0.01', 'ether')

let unlock
let lock
let unlockOwner, keyOwner, anotherKeyOwner

describe('Unlock / resetTrackedValue', () => {
  beforeEach(async () => {
    ;({ unlock } = await deployContracts())
    lock = await deployLock({ unlock })
    ;[unlockOwner, keyOwner, anotherKeyOwner] = await ethers.getSigners()
    await purchaseKey(lock, keyOwner.address)
  })

  it('grossNetworkProduct has a non-zero value after a purchase', async () => {
    const grossNetworkProduct = await unlock.grossNetworkProduct()
    compareBigNumbers(grossNetworkProduct, keyPrice)
  })

  it('should fail to resetTrackedValue if called from a non-owner account', async () => {
    await reverts(
      unlock.connect(keyOwner).resetTrackedValue(0, 0),
      'ONLY_OWNER'
    )
  })

  describe('resetTrackedValue to 0', async () => {
    beforeEach(async () => {
      await unlock.connect(unlockOwner).resetTrackedValue(0, 0)
    })

    it('grossNetworkProduct is now 0', async () => {
      const grossNetworkProduct = await unlock.grossNetworkProduct()
      compareBigNumbers(grossNetworkProduct, 0)
    })

    describe('After purchase', () => {
      beforeEach(async () => {
        await purchaseKey(lock, anotherKeyOwner.address)
      })

      it('grossNetworkProduct has a non-zero value after a purchase', async () => {
        const grossNetworkProduct = await unlock.grossNetworkProduct()
        compareBigNumbers(grossNetworkProduct, keyPrice)
      })
    })
  })

  describe('resetTrackedValue to 42', async () => {
    beforeEach(async () => {
      await unlock.connect(unlockOwner).resetTrackedValue(42, 0)
    })

    it('grossNetworkProduct is now 42', async () => {
      const grossNetworkProduct = await unlock.grossNetworkProduct()
      compareBigNumbers(grossNetworkProduct, 42)
    })

    describe('After purchase', () => {
      beforeEach(async () => {
        await purchaseKey(lock, anotherKeyOwner.address)
      })

      it('grossNetworkProduct has a non-zero value after a purchase', async () => {
        const grossNetworkProduct = await unlock.grossNetworkProduct()
        compareBigNumbers(grossNetworkProduct, keyPrice.add(42))
      })
    })
  })
})
