const { deployLock, ADDRESS_ZERO } = require('../helpers')

contract('Lock / purchaseForFrom', (accounts) => {
  let lock
  let lockFree
  before(async () => {
    lock = await deployLock()
    lockFree = await deployLock({ name: 'FREE' })
    await lock.setMaxKeysPerAddress(10)
  })

  describe('if the referrer does not have a key', () => {
    it('should succeed', async () => {
      await lock.purchase(
        [],
        [accounts[0]],
        [accounts[1]],
        [ADDRESS_ZERO],
        [[]],
        {
          value: web3.utils.toWei('0.01', 'ether'),
        }
      )
    })
  })

  describe('if the referrer has a key', () => {
    it('should succeed', async () => {
      await lock.purchase(
        [],
        [accounts[0]],
        [ADDRESS_ZERO],
        [ADDRESS_ZERO],
        [[]],
        {
          value: web3.utils.toWei('0.01', 'ether'),
        }
      )
      await lock.purchase(
        [],
        [accounts[1]],
        [accounts[0]],
        [ADDRESS_ZERO],
        [[]],
        {
          value: web3.utils.toWei('0.01', 'ether'),
        }
      )
    })

    it('can purchaseForFrom a free key', async () => {
      await lockFree.purchase(
        [],
        [accounts[0]],
        [ADDRESS_ZERO],
        [ADDRESS_ZERO],
        [[]]
      )
      const tx = await lockFree.purchase(
        [],
        [accounts[2]],
        [accounts[0]],
        [ADDRESS_ZERO],
        [[]]
      )
      assert.equal(tx.logs[0].event, 'Transfer')
      assert.equal(tx.logs[0].args.from, 0)
      assert.equal(tx.logs[0].args.to, accounts[2])
    })
  })
})
