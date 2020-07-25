const BigNumber = require('bignumber.js')

const unlockContract = artifacts.require('Unlock.sol')
const getProxy = require('../helpers/proxy')
const WalletService = require('../helpers/walletServiceMock.js')

let unlock

contract('Unlock / gas', (accounts) => {
  let createLockGas = new BigNumber(42)

  beforeEach(async () => {
    unlock = await getProxy(unlockContract)

    let tx = await unlock.createLock(
      60 * 60 * 24 * 30, // expirationDuration: 30 days
      web3.utils.padLeft(0, 40),
      web3.utils.toWei('1', 'ether'), // keyPrice: in wei
      100, // maxNumberOfKeys
      'Gas Test Lock',
      '0x000000000000000000000000',
      {
        from: accounts[0],
      }
    )
    createLockGas = new BigNumber(tx.receipt.gasUsed)
  })

  it('gas used to createLock is less than wallet service limit', async () => {
    if (!process.env.TEST_COVERAGE) {
      assert(createLockGas.lte(WalletService.gasAmountConstants().createLock))
    }
  })
})
