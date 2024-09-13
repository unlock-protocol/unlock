const assert = require('assert')
const { ethers } = require('hardhat')

const { deployLock, ADDRESS_ZERO } = require('../helpers')
const WalletService = require('../helpers/walletServiceMock.js')

describe('Lock / gas', () => {
  it('gas used to purchaseFor is less than wallet service limit', async () => {
    const lock = await deployLock()
    const [signer] = await ethers.getSigners()
    let tx = await lock.purchase(
      [],
      [await signer.getAddress()],
      [ADDRESS_ZERO],
      [ADDRESS_ZERO],
      ['0x'],
      {
        value: ethers.parseUnits('0.01', 'ether'),
      }
    )
    const { gasUsed } = await tx.wait()
    if (!process.env.TEST_COVERAGE) {
      assert(gasUsed <= WalletService.gasAmountConstants().purchaseKey)
    }
  })
})
