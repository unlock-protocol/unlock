const { ethers } = require('hardhat')
const { reverts, deployContracts } = require('../helpers')

let unlock
let unlockOwner, someAccount

describe('Lock / configUnlock', () => {
  before(async () => {
    ;({ unlock } = await deployContracts())
    ;[unlockOwner, someAccount] = await ethers.getSigners()
  })

  describe('configuring the Unlock contract', () => {
    it('should let the owner configure the Unlock contract', async () => {
      await unlock.connect(unlockOwner).configUnlock(
        await unlock.governanceToken(),
        await unlock.weth(),
        0,
        '',
        '',
        1 // mainnet
      )
    })

    it('should revert if called by other than the owner', async () => {
      await reverts(
        unlock.connect(someAccount).configUnlock(
          await unlock.governanceToken(),
          await unlock.weth(),
          0,
          '',
          '',
          1 // mainnet
        ),
        'ONLY_OWNER'
      )
    })
  })
})
