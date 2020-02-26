const { reverts } = require('truffle-assertions')
const deployLocks = require('../../helpers/deployLocks')

const unlockContract = artifacts.require('Unlock.sol')
const getProxy = require('../../helpers/proxy')

let locks
let ID

contract('Lock / erc721 / getApproved', accounts => {
  const keyPurchaser = accounts[3]

  before(async () => {
    this.unlock = await getProxy(unlockContract)
    locks = await deployLocks(this.unlock, accounts[0])
  })

  before(async () => {
    await locks.FIRST.purchase(0, keyPurchaser, web3.utils.padLeft(0, 40), [], {
      value: web3.utils.toWei('0.01', 'ether'),
      from: keyPurchaser,
    })
    ID = await locks.FIRST.getTokenIdFor.call(keyPurchaser)
  })

  describe('getApproved', () => {
    it('should fail if no one was approved for a key', async () => {
      await reverts(locks.FIRST.getApproved.call(ID), 'NONE_APPROVED')
    })
  })
})
