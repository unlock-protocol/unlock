const Units = require('ethereumjs-units')
const BigNumber = require('bignumber.js')
const Unlock = artifacts.require('../Unlock.sol')

let unlock

contract('Unlock', (accounts) => {
  before(async () => {
    unlock = await Unlock.deployed()
  })

  describe('gas usage', () => {
    it('^ gas used to createLock', async () => {
      let tx = await unlock.createLock(
        60 * 60 * 24 * 30, // expirationDuration: 30 days
        Units.convert(1, 'eth', 'wei'), // keyPrice: in wei
        100 // maxNumberOfKeys
        , {
          from: accounts[0]
        })
      const gasUsed = new BigNumber(tx.receipt.gasUsed)
      console.log(gasUsed.toFormat())
      if (!process.env.TEST_COVERAGE) {
        // If this breaks, update unlock-app/src/services/walletService.js gasAmountConstants
        assert(gasUsed.lte(2500000))
      }
    })
  })
})
