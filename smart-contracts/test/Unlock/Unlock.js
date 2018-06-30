const Unlock = artifacts.require('./Unlock.sol')

contract('Unlock', (accounts) => {
  let unlock

  before(() => {
    return Unlock.deployed()
      .then(_unlock => {
        unlock = _unlock
      })
  })

  it('should have an owner', () => {
    return unlock.owner().then((owner) => {
      assert.equal(owner, accounts[0])
    })
  })

  it('should have initialized grossNetworkProduct', () => {
    return unlock.grossNetworkProduct().then((grossNetworkProduct) => {
      assert.equal(grossNetworkProduct.toNumber(), 0)
    })
  })

  it('should have initialized totalDiscountGranted', () => {
    return unlock.totalDiscountGranted().then((totalDiscountGranted) => {
      assert.equal(totalDiscountGranted.toNumber(), 0)
    })
  })
})
