const Units = require('ethereumjs-units')
const BigNumber = require('bignumber.js')
const deployLocks = require('../helpers/deployLocks')
const unlockContract = artifacts.require('../Unlock.sol')
const getUnlockProxy = require('../helpers/proxy')
const WalletService = require('../helpers/walletServiceMock.js')

let unlock, lock

contract('Lock / gas', accounts => {
  beforeEach(async () => {
    unlock = await getUnlockProxy(unlockContract)
    const locks = await deployLocks(unlock, accounts[0])
    lock = locks['FIRST']
  })

  it(`gas used to purchaseFor is less than wallet service limit`, async () => {
    let tx = await lock.purchaseFor(accounts[0], {
      value: Units.convert('0.01', 'eth', 'wei'),
    })
    const gasUsed = new BigNumber(tx.receipt.gasUsed)
    if (!process.env.TEST_COVERAGE) {
      assert(gasUsed.lte(WalletService.gasAmountConstants().purchaseKey))
    }
  })
})
