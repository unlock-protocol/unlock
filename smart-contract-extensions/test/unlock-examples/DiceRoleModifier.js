const { constants, protocols } = require('hardlydifficult-eth')
const BigNumber = require('bignumber.js')

const DiceRoleModifier = artifacts.require('DiceRoleModifier')

contract('DiceRoleModifier', accounts => {
  const keyOwner = accounts[2]
  const nonKeyOwner = accounts[3]
  let lock
  let featureContract

  beforeEach(async () => {
    lock = await protocols.unlock.createTestLock(web3, {
      keyPrice: web3.utils.toWei('0.01', 'ether'),
      from: accounts[1], // Lock owner
    })

    // Buy a key from the `keyOwner` account
    const keyPrice = await lock.keyPrice()
    await lock.purchase(keyPrice, keyOwner, constants.ZERO_ADDRESS, [], {
      from: keyOwner,
      value: keyPrice,
    })

    featureContract = await DiceRoleModifier.new(lock.address)
  })

  it('Key owner always rolls 3-22 (inclusive)', async () => {
    for (let i = 0; i < 100; i++) {
      const tx = await featureContract.rollDie({
        from: keyOwner,
      })
      const lastRoll = new BigNumber(tx.receipt.logs[0].args.value)
      assert(lastRoll.gte(3))
      assert(lastRoll.lte(22))
    }
  })

  it('All other accounts roll 1-20 (inclusive)', async () => {
    for (let i = 0; i < 100; i++) {
      const tx = await featureContract.rollDie({
        from: nonKeyOwner,
      })
      const lastRoll = new BigNumber(tx.receipt.logs[0].args.value)
      assert(lastRoll.gte(1))
      assert(lastRoll.lte(20))
    }
  })
})
