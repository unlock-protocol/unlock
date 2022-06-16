const { ADDRESS_ZERO } = require('../helpers/constants')

const { reverts } = require('../helpers/errors')
const deployLocks = require('../helpers/deployLocks')

const unlockContract = artifacts.require('Unlock.sol')
const getContractInstance = require('../helpers/truffle-artifacts')

let unlock
let locks

contract('Lock / soldOut', (accounts) => {
  beforeEach(async () => {
    unlock = await getContractInstance(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
    await locks.FIRST.setMaxKeysPerAddress(10)
  })

  it('should revert if we reached the max number of keys', async () => {
    const buyers = accounts.slice(0, 8)
    await locks.FIRST.purchase(
      [],
      buyers,
      buyers.map(() => ADDRESS_ZERO),
      buyers.map(() => ADDRESS_ZERO),
      buyers.map(() => []),
      {
        value: web3.utils.toWei('0.08', 'ether'),
      }
    )

    await reverts(
      locks.FIRST.purchase(
        [],
        accounts.slice(0, 3),
        accounts.slice(0, 3).map(() => ADDRESS_ZERO),
        accounts.slice(0, 3).map(() => ADDRESS_ZERO),
        accounts.slice(0, 3).map(() => []),
        {
          value: web3.utils.toWei('0.04', 'ether'),
        }
      ),
      'LOCK_SOLD_OUT'
    )
  })
})
