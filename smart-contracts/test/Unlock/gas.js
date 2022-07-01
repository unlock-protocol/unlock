const { ethers } = require('hardhat')
const BigNumber = require('bignumber.js')

const WalletService = require('../helpers/walletServiceMock.js')
const createLockHash = require('../helpers/createLockCalldata')
const { ADDRESS_ZERO, deployContracts } = require('../helpers')

let unlock
let createLockGas = new BigNumber(42)

describe('Unlock / gas', (accounts) => {
  before(async () => {
    ;({ unlock } = await deployContracts())

    const args = [
      60 * 60 * 24 * 30, // expirationDuration: 30 days
      ADDRESS_ZERO,
      ethers.utils.parseUnits('1', 'ether'), // keyPrice: in wei
      100, // maxNumberOfKeys
      'Gas Test Lock',
    ]
    const calldata = await createLockHash({ args, from: accounts[0] })
    const tx = await unlock.createUpgradeableLock(calldata)
    createLockGas = new BigNumber(tx.receipt.gasUsed)
  })

  it('gas used to createLock is less than wallet service limit', async () => {
    if (!process.env.TEST_COVERAGE) {
      assert(createLockGas.lte(WalletService.gasAmountConstants().createLock))
    }
  })
})
