const { reverts } = require('../helpers')

const unlockContract = artifacts.require('Unlock.sol')
const getContractInstance = require('../helpers/truffle-artifacts')

let unlock
let unlockOwner

contract('Lock / configUnlock', (accounts) => {
  before(async () => {
    unlock = await getContractInstance(unlockContract)
    unlockOwner = accounts[0]
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
