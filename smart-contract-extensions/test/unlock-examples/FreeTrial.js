const { constants, protocols } = require('hardlydifficult-eth')
const { time } = require('@openzeppelin/test-helpers')

const truffleAssert = require('truffle-assertions')

const FreeTrial = artifacts.require('FreeTrial')

contract('DiceRoleModifier', accounts => {
  const keyOwner = accounts[1]
  const nonKeyOwner = accounts[2]
  let lock
  let featureContract

  before(async () => {
    lock = await protocols.unlock.createTestLock(web3, {
      keyPrice: web3.utils.toWei('0.01', 'ether'),
      from: accounts[1], // Lock owner
    })

    // Buy a key from the `keyOwner` account
    const keyPrice = await lock.keyPrice()
    await lock.purchase(keyPrice, keyOwner, constants.ZERO_ADDRESS, [], {
      from: keyOwner,
      value: await lock.keyPrice(),
    })

    featureContract = await FreeTrial.new(lock.address)
  })

  it('Any account can use the feature the first time', async () => {
    await featureContract.exampleFeature({
      from: keyOwner,
    })
    await featureContract.exampleFeature({
      from: nonKeyOwner,
    })
  })

  it('The key owner can keep using the feature!', async () => {
    for (let i = 0; i < 100; i++) {
      await featureContract.exampleFeature({
        from: keyOwner,
      })
    }
  })

  it('Non-key owners cannot use the feature again right away', async () => {
    await truffleAssert.fails(
      featureContract.exampleFeature({
        from: nonKeyOwner,
      }),
      truffleAssert.ErrorType.REVERT,
      'Limited to one call per day, unless you purchase a Key!'
    )
  })

  describe('after 24 hours', () => {
    before(async () => {
      await time.increase(time.duration.days(1))
    })

    it('Non-key owners can use the feature one more time', async () => {
      await featureContract.exampleFeature({
        from: nonKeyOwner,
      })
    })

    it('And then Non-key owners cannot use the feature again right away', async () => {
      await truffleAssert.fails(
        featureContract.exampleFeature({
          from: nonKeyOwner,
        }),
        truffleAssert.ErrorType.REVERT,
        'Limited to one call per day, unless you purchase a Key!'
      )
    })
  })
})
