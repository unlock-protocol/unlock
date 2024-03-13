const { assert } = require('chai')
const { ethers } = require('hardhat')

const { deployLock, ADDRESS_ZERO } = require('../helpers')
const WalletService = require('../helpers/walletServiceMock.js')

describe('Lock / gas', () => {
  it('gas used to purchaseFor is less than wallet service limit', async () => {
    const lock = await deployLock()
    const [signer] = await ethers.getSigners()
    let tx = await lock.purchase(
      [],
      [signer.address],
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
