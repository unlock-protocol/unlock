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

  describe('extending keys', () => {
    it('should not duplicate tokenIDs', async () => {
      // buy some keys
      const tx = await lock.purchase(
        [],
        keyOwners,
        keyOwners.map(() => web3.utils.padLeft(0, 40)),
        keyOwners.map(() => web3.utils.padLeft(0, 40)),
        keyOwners.map(() => []),
        {
          value: web3.utils.toWei(`${0.01 * keyOwners.length}`, 'ether'),
          from: accounts[0],
        }
      )
      const tokenIds = tx.logs
        .filter((v) => v.event === 'Transfer')
        .map(({ args }) => args.tokenId)

      const supply = await lock.totalSupply()
      assert(tokenIds[tokenIds.length - 1].eq(supply))

      // extend a key
      await lock.extend(0, tokenIds[1], web3.utils.padLeft(0, 40), [], {
        value: web3.utils.toWei('0.01', 'ether'),
        from: keyOwner1,
      })

      // make sure no new keys have been created
      assert(tokenIds[tokenIds.length - 1].eq(await lock.totalSupply()))
    })
  })
})
