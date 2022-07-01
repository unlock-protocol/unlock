const { reverts, deployContracts } = require('../helpers')

let unlock
let unlockOwner

describe('Lock / configUnlock', (accounts) => {
  before(async () => {
    ;({ unlock } = await deployContracts())
    ;[unlockOwner] = accounts
  })

  describe('configuring the Unlock contract', () => {
    it('should let the owner configure the Unlock contract', async () => {
      await unlock.configUnlock(
        await unlock.udt(),
        await unlock.weth(),
        0,
        '',
        '',
        1, // mainnet
        {
          from: unlockOwner,
        }
      )
    })

    it('should revert if called by other than the owner', async () => {
      await reverts(
        unlock.configUnlock(
          await unlock.udt(),
          await unlock.weth(),
          0,
          '',
          '',
          1, // mainnet
          {
            from: accounts[7],
          }
        ),
        'ONLY_OWNER'
      )
    })
  })
})
