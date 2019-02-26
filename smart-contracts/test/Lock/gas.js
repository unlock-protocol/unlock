const Units = require('ethereumjs-units')
const Web3Utils = require('web3-utils')
const BigNumber = require('bignumber.js')
const deployLocks = require('../helpers/deployLocks')
const Unlock = artifacts.require('../Unlock.sol')
const WalletService = require('../helpers/walletServiceMock.js')

let unlock, lock

contract('Lock', (accounts) => {
  beforeEach(async () => {
    unlock = await Unlock.deployed()
    const locks = await deployLocks(unlock)
    lock = locks['FIRST']
  })

  describe('gas usage', () => {
    it(`gas used to purchaseFor is less than wallet service limit`, async () => {
      let tx = await lock
        .purchaseFor(accounts[0], Web3Utils.toHex('Julien'), {
          value: Units.convert('0.01', 'eth', 'wei')
        })
      const gasUsed = new BigNumber(tx.receipt.gasUsed)
      if (!process.env.TEST_COVERAGE) {
        assert(gasUsed.lte(WalletService.gasAmountConstants().purchaseKey))
      }
    })
  })
})
