const Units = require('ethereumjs-units')
const BigNumber = require('bignumber.js')
const deployLocks = require('../../helpers/deployLocks')

const unlockContract = artifacts.require('Unlock.sol')
const getProxy = require('../../helpers/proxy')

let unlock, locks, lock

contract('Lock / uniqueTokenIds', accounts => {
  let lockOwner = accounts[9]
  let keyOwner1 = accounts[1]
  let keyOwner2 = accounts[2]
  const keyOwners = [keyOwner1, keyOwner2, accounts[3], accounts[4]]
  const keyPrice = new BigNumber(Units.convert(0.01, 'eth', 'wei'))

  before(async () => {
    unlock = await getProxy(unlockContract)
    locks = await deployLocks(unlock, lockOwner)
    lock = locks['SECOND']
  })

  describe('repurchasing expired keys', () => {
    it('re-purchasing 2 expired keys should not duplicate tokenIDs', async () => {
      const purchases = keyOwners.map(account => {
        return lock.purchase(0, account, web3.utils.padLeft(0, 40), [], {
          value: keyPrice.toFixed(),
          from: account,
        })
      })
      // buy some keys
      await Promise.all(purchases)
      let tokenId1Before = await lock.getTokenIdFor(keyOwner1)
      let tokenId2Before = await lock.getTokenIdFor(keyOwner2)
      const keyExpirations = keyOwners.map(account => {
        return lock.expireKeyFor(account, {
          from: lockOwner,
        })
      })
      // expire keys
      await Promise.all(keyExpirations)
      // repurchase keys
      let tx1 = await lock.purchase(
        0,
        keyOwner1,
        web3.utils.padLeft(0, 40),
        [],
        {
          value: keyPrice.toFixed(),
          from: keyOwner1,
        }
      )
      let tx2 = await lock.purchase(
        0,
        keyOwner2,
        web3.utils.padLeft(0, 40),
        [],
        {
          value: keyPrice.toFixed(),
          from: keyOwner2,
        }
      )
      let ID1 = tx1.logs[0].args.tokenId
      let ID2 = tx2.logs[0].args.tokenId
      let tokenId1After = await lock.getTokenIdFor(keyOwner1)
      let tokenId2After = await lock.getTokenIdFor(keyOwner2)
      let supply = await lock.totalSupply()
      assert(tokenId1Before.eq(tokenId1After))
      assert(tokenId2Before.eq(tokenId2After))
      assert(tokenId1After.eq(ID1))
      assert(tokenId2After.eq(ID2))
      assert(supply.gt(tokenId1After))
      assert(supply.gt(tokenId2After))
    })
  })
})
