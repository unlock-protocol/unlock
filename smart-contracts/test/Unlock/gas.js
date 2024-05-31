const assert = require('assert')
const { ethers } = require('hardhat')

const WalletService = require('../helpers/walletServiceMock.js')
const { createLockCalldata } = require('@unlock-protocol/hardhat-helpers')
const { ADDRESS_ZERO, deployContracts } = require('../helpers')

describe('Unlock / gas', () => {
  it('gas used to createLock is less than wallet service limit', async () => {
    const { unlock } = await deployContracts()
    const [signer] = await ethers.getSigners()

    const args = [
      60 * 60 * 24 * 30, // expirationDuration: 30 days
      ADDRESS_ZERO,
      ethers.parseUnits('1', 'ether'), // keyPrice: in wei
      100, // maxNumberOfKeys
      'Gas Test Lock',
    ]
    const calldata = await createLockCalldata({
      args,
      from: await signer.getAddress(),
    })
    const tx = await unlock.createUpgradeableLock(calldata)
    const { gasUsed } = await tx.wait()
    if (!process.env.TEST_COVERAGE) {
      assert(gasUsed <= WalletService.gasAmountConstants().createLock)
    }
  })
})
