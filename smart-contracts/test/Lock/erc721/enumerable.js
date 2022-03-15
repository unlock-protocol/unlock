const { reverts } = require('truffle-assertions')
const deployLocks = require('../../helpers/deployLocks')

const unlockContract = artifacts.require('Unlock.sol')
const getProxy = require('../../helpers/proxy')

let unlock
let locks
let lock
let tokenIds

contract('Lock / erc721 / enumerable', (accounts) => {
  before(async () => {
    unlock = await getProxy(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
    lock = locks.FIRST

    // Buy test keys for each account
    const keyPrice = await lock.keyPrice()
    const keyOwners = accounts.slice(0, 5)
    const tx = await lock.purchase(
      [],
      keyOwners,
      keyOwners.map(() => web3.utils.padLeft(0, 40)),
      keyOwners.map(() => web3.utils.padLeft(0, 40)),
      [],
      {
        value: (keyPrice * keyOwners.length).toString(),
        from: accounts[0],
      }
    )

    tokenIds = tx.logs
      .filter((v) => v.event === 'Transfer')
      .map(({ args }) => args.tokenId)
  })

  it('tokenByIndex is a no-op', async () => {
    for (let i = 0; i < 5; i++) {
      const id = await lock.tokenByIndex(i)
      assert.equal(id.toString(), i)
    }
  })

  it('tokenByIndex greater than totalSupply shouldFail', async () => {
    await reverts(lock.tokenByIndex(5))
  })

  it('tokenOfOwnerByIndex forwards to getTokenIdFor when index == 0', async () => {
    for (let i = 0; i < 5; i++) {
      const id = await lock.tokenOfOwnerByIndex(accounts[i], 0)
      const expected = tokenIds[i]
      assert.equal(id.toString(), expected.toString())
    }
  })

  it('tokenOfOwnerByIndex fails when index > 0', async () => {
    await reverts(lock.tokenOfOwnerByIndex(accounts[0], 1))
  })
})
