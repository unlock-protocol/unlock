const deployLocks = require('../../helpers/deployLocks')
const shouldFail = require('../../helpers/shouldFail')

const unlockContract = artifacts.require('../Unlock.sol')
const getProxy = require('../../helpers/proxy')

let unlock, locks, lock

contract('Lock / erc721 / approve', accounts => {
  before(async () => {
    unlock = await getProxy(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
    lock = locks['FIRST']

    // Buy test keys for each account
    const keyPrice = await lock.keyPrice()
    for (let i = 0; i < 5; i++) {
      await lock.purchase(0, accounts[i], web3.utils.padLeft(0, 40), [], {
        value: keyPrice.toString(),
        from: accounts[i],
      })
    }
  })

  it('tokenByIndex is a no-op', async () => {
    for (let i = 0; i < 5; i++) {
      const id = await lock.tokenByIndex(i)
      assert.equal(id.toString(), i)
    }
  })

  it('tokenByIndex greater than totalSupply shouldFail', async () => {
    await shouldFail(lock.tokenByIndex(5))
  })

  it('tokenOfOwnerByIndex forwards to getTokenIdFor when index == 0', async () => {
    for (let i = 0; i < 5; i++) {
      const id = await lock.tokenOfOwnerByIndex(accounts[i], 0)
      const expected = await lock.getTokenIdFor(accounts[i])
      assert.equal(id.toString(), expected.toString())
    }
  })

  it('tokenOfOwnerByIndex fails when index > 0', async () => {
    await shouldFail(lock.tokenOfOwnerByIndex(accounts[0], 1))
  })
})
