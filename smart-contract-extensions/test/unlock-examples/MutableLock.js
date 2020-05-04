const { constants, protocols } = require('hardlydifficult-eth')
const truffleAssert = require('truffle-assertions')

const MutableLock = artifacts.require('MutableLock')

contract('MutableLock', accounts => {
  const lockOwner = accounts[0]
  const keyOwner = accounts[1]
  const nonKeyOwner = accounts[2]
  let lock
  let featureContract

  before(async () => {
    lock = await protocols.unlock.createTestLock(web3, {
      keyPrice: web3.utils.toWei('0.01', 'ether'),
      from: lockOwner,
    })

    // Buy a key from the `keyOwner` account
    const keyPrice = await lock.keyPrice()
    await lock.purchase(keyPrice, keyOwner, constants.ZERO_ADDRESS, [], {
      from: keyOwner,
      value: await lock.keyPrice(),
    })

    featureContract = await MutableLock.new()
  })

  it('Anyone can call the feature when no lock is assigned', async () => {
    await featureContract.paidOnlyFeature({
      from: keyOwner,
    })
    await featureContract.paidOnlyFeature({
      from: nonKeyOwner,
    })
  })

  describe('When a lock is assigned', () => {
    before(async () => {
      await featureContract.setLock(lock.address, { from: lockOwner })
    })

    it('Key owner can call the function', async () => {
      await featureContract.paidOnlyFeature({
        from: keyOwner,
      })
    })

    it('A call from a non-key owning account will revert', async () => {
      await truffleAssert.fails(
        featureContract.paidOnlyFeature({
          from: nonKeyOwner,
        }),
        truffleAssert.ErrorType.REVERT,
        'Purchase a key first!'
      )
    })
  })
})
