const { ethers } = require('hardhat')
const BigNumber = require('bignumber.js')
const deployLocks = require('../helpers/deployLocks')

const { ADDRESS_ZERO } = require('../helpers/constants')
const unlockContract = artifacts.require('Unlock.sol')
const getContractInstance = require('../helpers/truffle-artifacts')
const WalletService = require('../helpers/walletServiceMock.js')

let unlock
let lock

contract('Lock / gas', (accounts) => {
  beforeEach(async () => {
    unlock = await getContractInstance(unlockContract)
    const locks = await deployLocks(unlock, accounts[0])
    lock = locks.FIRST
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
