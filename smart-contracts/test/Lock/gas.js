const Units = require('ethereumjs-units')
const Web3Utils = require('web3-utils')
const BigNumber = require('bignumber.js')

const deployLocks = require('../helpers/deployLocks')
const Unlock = artifacts.require('../Unlock.sol')

let unlock, lock

contract('Lock', (accounts) => {
  beforeEach(async () => {
    unlock = await Unlock.deployed()
    const locks = await deployLocks(unlock)
    lock = locks['FIRST']
  })

  describe('gas usage', () => {
    it('^ gas used to purchaseFor w/o key data', async () => {
      let tx = await lock
        .purchaseFor(accounts[0], '', {
          value: Units.convert('0.01', 'eth', 'wei')
        })
      const gasUsed = new BigNumber(tx.receipt.gasUsed)
      console.log(gasUsed.toFormat())
      if (!process.env.TEST_COVERAGE) {
        // If this breaks, update unlock-app/src/services/walletService.js gasAmountConstants
        assert(gasUsed.lte(1000000))
      }
    })

    it('^ gas used to purchaseFor w/ key data', async () => {
      let tx = await lock
        .purchaseFor(accounts[0], Web3Utils.toHex('Julien'), {
          value: Units.convert('0.01', 'eth', 'wei')
        })
      const gasUsed = new BigNumber(tx.receipt.gasUsed)
      console.log(gasUsed.toFormat())
      if (!process.env.TEST_COVERAGE) {
        // If this breaks, update unlock-app/src/services/walletService.js gasAmountConstants
        assert(gasUsed.lte(1000000))
      }
    })

    it('^ gas used to transferFrom w/o key data', async () => {
      await lock
        .purchaseFor(accounts[0], '', {
          value: Units.convert('0.01', 'eth', 'wei')
        })
      let tx = await lock.transferFrom(accounts[0], accounts[1],
        await lock.getTokenIdFor.call(accounts[0]), {
          from: accounts[0]
        })
      const gasUsed = new BigNumber(tx.receipt.gasUsed)
      console.log(gasUsed.toFormat())
      if (!process.env.TEST_COVERAGE) {
        assert(gasUsed.lte(1000000))
      }
    })

    it('^ gas used to transferFrom w/ key data', async () => {
      await lock
        .purchaseFor(accounts[2], Web3Utils.toHex('Julien'), {
          value: Units.convert('0.01', 'eth', 'wei')
        })
      let tx = await lock.transferFrom(accounts[2], accounts[1],
        await lock.getTokenIdFor.call(accounts[2]), {
          from: accounts[2]
        })
      const gasUsed = new BigNumber(tx.receipt.gasUsed)
      console.log(gasUsed.toFormat())
      if (!process.env.TEST_COVERAGE) {
        assert(gasUsed.lte(1000000))
      }
    })
  })
})
