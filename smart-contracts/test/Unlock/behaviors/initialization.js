exports.shouldHaveInitialized = function (unlockOwner) {
  describe('initialization', function () {
    it('should have an owner', async function () {
      const owner = await this.unlock.owner()
      assert.equal(owner, unlockOwner)
    })

    it('should have initialized grossNetworkProduct', async function () {
      const grossNetworkProduct = await this.unlock.grossNetworkProduct()
      assert.equal(grossNetworkProduct.toNumber(), 0)
    })

    it('should have initialized totalDiscountGranted', async function () {
      const totalDiscountGranted = await this.unlock.totalDiscountGranted()
      assert.equal(totalDiscountGranted.toNumber(), 0)
    })
  })
}
