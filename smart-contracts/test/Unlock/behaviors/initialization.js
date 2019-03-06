const Web3Utils = require('web3-utils')
const BigNumber = require('bignumber.js')

exports.shouldHaveInitialized = function (unlockOwner) {
  describe('Unlock / behaviors / initialization', function () {
    it('should have an owner', async function () {
      const owner = await this.unlock.methods.owner().call()
      assert.equal(owner, Web3Utils.toChecksumAddress(unlockOwner))
    })

    it('should have initialized grossNetworkProduct', async function () {
      const grossNetworkProduct = new BigNumber(await this.unlock.methods.grossNetworkProduct().call())
      assert.equal(grossNetworkProduct.toFixed(), 0)
    })

    it('should have initialized totalDiscountGranted', async function () {
      const totalDiscountGranted = new BigNumber(await this.unlock.methods.totalDiscountGranted().call())
      assert.equal(totalDiscountGranted.toFixed(), 0)
    })
  })
}
