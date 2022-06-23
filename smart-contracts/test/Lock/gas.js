const { ethers } = require('hardhat')
const BigNumber = require('bignumber.js')

const { deployLock, ADDRESS_ZERO } = require('../helpers')
const WalletService = require('../helpers/walletServiceMock.js')

let lock

contract('Lock / gas', (accounts) => {
  before(async () => {
    lock = await deployLock()
  })

  it('gas used to purchaseFor is less than wallet service limit', async () => {
    let tx = await lock.purchase(
      [],
      [accounts[0]],
      [ADDRESS_ZERO],
      [ADDRESS_ZERO],
      [[]],
      {
        value: ethers.utils.parseUnits('0.01', 'ether'),
      }
    )
    const gasUsed = new BigNumber(tx.receipt.gasUsed)
    if (!process.env.TEST_COVERAGE) {
      assert(gasUsed.lte(WalletService.gasAmountConstants().purchaseKey))
    }
  })
})
