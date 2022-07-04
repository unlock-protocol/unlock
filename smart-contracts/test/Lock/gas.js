const { ethers } = require('hardhat')
const { assert } = require('chai')

const { deployLock, ADDRESS_ZERO } = require('../helpers')
const WalletService = require('../helpers/walletServiceMock.js')

let lock

describe('Lock / gas', () => {
  before(async () => {
    lock = await deployLock()
  })

  it('gas used to purchaseFor is less than wallet service limit', async () => {
    const [account] = await ethers.getSigners()
    let tx = await lock.purchase(
      [],
      [account.address],
      [ADDRESS_ZERO],
      [ADDRESS_ZERO],
      [[]],
      {
        value: ethers.utils.parseUnits('0.01', 'ether'),
      }
    )
    const { gasUsed } = await tx.wait()
    if (!process.env.TEST_COVERAGE) {
      assert(gasUsed.lte(WalletService.gasAmountConstants().purchaseKey))
    }
  })
})
