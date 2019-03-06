const Units = require('ethereumjs-units')
const BigNumber = require('bignumber.js')
const Unlock = artifacts.require('../Unlock.sol')
const WalletService = require('../helpers/walletServiceMock.js')

let unlock

contract('Unlock / gas', (accounts) => {
  let createLockGas = new BigNumber(42)

  beforeEach(async () => {
    unlock = await Unlock.deployed()

    let tx = await unlock.createLock(
      60 * 60 * 24 * 30, // expirationDuration: 30 days
      Units.convert(1, 'eth', 'wei'), // keyPrice: in wei
      100 // maxNumberOfKeys
      , {
        from: accounts[0]
      })
    createLockGas = new BigNumber(tx.receipt.gasUsed)
  })

  it(`gas used to createLock is less than wallet service limit`, async () => {
    if (!process.env.TEST_COVERAGE) {
      assert(createLockGas.lte(WalletService.gasAmountConstants().createLock))
    }
  })
})
