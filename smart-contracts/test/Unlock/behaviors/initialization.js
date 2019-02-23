const BigNumber = require('bignumber.js')

exports.shouldHaveInitialized = function (unlockOwner) {
  describe('initialization', function () {
    it('should have an owner', async function () {
      const owner = await this.unlock.owner().call()
      assert.equal(owner, unlockOwner)
    })

    it('should have initialized grossNetworkProduct', async function () {
      const grossNetworkProduct = new BigNumber(await this.unlock.grossNetworkProduct().call())
      assert.equal(grossNetworkProduct.toFixed(), 0)
    })

    it('should have initialized totalDiscountGranted', async function () {
      const totalDiscountGranted = new BigNumber(await this.unlock.totalDiscountGranted().call())
      assert.equal(totalDiscountGranted.toFixed(), 0)
    })
  })
}
