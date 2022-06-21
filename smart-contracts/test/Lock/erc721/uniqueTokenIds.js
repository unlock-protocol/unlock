const { ADDRESS_ZERO, purchaseKeys, deployLock } = require('../../helpers')

contract('Lock / uniqueTokenIds', (accounts) => {
  let lock
  let lockOwner = accounts[9]
  let keyOwner1 = accounts[1]
  let keyOwner2 = accounts[2]
  const keyOwners = [keyOwner1, keyOwner2, accounts[3], accounts[4]]

  before(async () => {
    lock = await deployLock({ from: lockOwner })
  })

  describe('extending keys', () => {
    it('should not duplicate tokenIDs', async () => {
      // buy some keys
      const { tokenIds } = await purchaseKeys(lock, keyOwners.length)

      const supply = await lock.totalSupply()
      assert.equal(tokenIds[tokenIds.length - 1].toNumber(), supply.toNumber())

      // extend a key
      await lock.extend(0, tokenIds[1], ADDRESS_ZERO, [], {
        value: web3.utils.toWei('0.01', 'ether'),
        from: keyOwner1,
      })

      // make sure no new keys have been created
      assert.equal(
        tokenIds[tokenIds.length - 1].toNumber(),
        (await lock.totalSupply()).toNumber()
      )
    })
  })
})
