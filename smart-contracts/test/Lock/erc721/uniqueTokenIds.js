const deployLocks = require('../../helpers/deployLocks')

const unlockContract = artifacts.require('Unlock.sol')
const getProxy = require('../../helpers/proxy')

let unlock
let locks
let lock

contract('Lock / uniqueTokenIds', (accounts) => {
  let lockOwner = accounts[9]
  let keyOwner1 = accounts[1]
  let keyOwner2 = accounts[2]
  const keyOwners = [keyOwner1, keyOwner2, accounts[3], accounts[4]]

  before(async () => {
    unlock = await getProxy(unlockContract)
    locks = await deployLocks(unlock, lockOwner)
    lock = locks.SECOND
  })

  describe('repurchasing expired keys', () => {
    it('re-purchasing 2 expired keys should not duplicate tokenIDs', async () => {
      // buy some keys
      await lock.purchase(
        0,
        keyOwners,
        keyOwners.map(() => web3.utils.padLeft(0, 40)),
        keyOwners.map(() => web3.utils.padLeft(0, 40)),
        [],
        {
          value: web3.utils.toWei(`${0.01 * keyOwners.length}`, 'ether'),
          from: accounts[0],
        }
      )
      let tokenId1Before = await lock.getTokenIdFor(keyOwner1)
      let tokenId2Before = await lock.getTokenIdFor(keyOwner2)
      const keyExpirations = keyOwners.map((account) => {
        return lock.expireAndRefundFor(account, 0, {
          from: lockOwner,
        })
      })
      // expire keys
      await Promise.all(keyExpirations)
      // repurchase keys
      await lock.purchase(
        0,
        [keyOwner1, keyOwner2],
        [web3.utils.padLeft(0, 40), web3.utils.padLeft(0, 40)],
        [web3.utils.padLeft(0, 40), web3.utils.padLeft(0, 40)],
        [],
        {
          value: web3.utils.toWei(`${0.01 * 2}`, 'ether'),
          from: keyOwner1,
        }
      )

      let tokenId1After = await lock.getTokenIdFor(keyOwner1)
      let tokenId2After = await lock.getTokenIdFor(keyOwner2)
      let supply = await lock.totalSupply()
      assert(tokenId1Before.eq(tokenId1After))
      assert(tokenId2Before.eq(tokenId2After))
      assert(supply.gt(tokenId1After))
      assert(supply.gt(tokenId2After))
      assert.notEqual(tokenId1After, tokenId2After)
    })
  })
})
