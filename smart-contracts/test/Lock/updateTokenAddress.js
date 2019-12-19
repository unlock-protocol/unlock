const deployLocks = require('../helpers/deployLocks')
const shouldFail = require('../helpers/shouldFail')

const TestErc20Token = artifacts.require('TestErc20Token.sol')
const unlockContract = artifacts.require('../Unlock.sol')
const getProxy = require('../helpers/proxy')

let unlock, locks, lock, lockOwner, token

contract('Lock / updateTokenAddress', accounts => {
  const invalidTokenAddress = accounts[9]

  before(async () => {
    token = await TestErc20Token.new()
    // Mint some tokens so that the totalSupply is greater than 0
    await token.mint(accounts[0], 1)
    unlock = await getProxy(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
    lock = locks['FIRST']
    lockOwner = accounts[0]
  })

  it('should revert if attempted by other than the lock owner', async () => {
    await shouldFail(
      lock.updateTokenAddress(accounts[9], {
        from: accounts[7],
      }),
      'Ownable: caller is not the owner'
    )
  })

  // think about this! should it?
  it.skip('should revert if the lock has been disabled', async () => {
    await shouldFail(
      lock.updateTokenAddress(accounts[9], {
        from: accounts[7],
      }),
      'LOCK_DEPRECATED'
    )
  })

  it('should revert if trying to switch to an invalid token address', async () => {
    await shouldFail(
      lock.updateTokenAddress(invalidTokenAddress, {
        from: lockOwner,
      }),
      'INVALID_TOKEN'
    )
  })

  it('should allow the lock owner to switch from eth => erc20', async () => {
    let tokenAddressBefore = await lock.tokenAddress()
    assert.equal(tokenAddressBefore, 0)
    await lock.updateTokenAddress(token.address, { from: lockOwner })
    let tokenAddressAfter = await lock.tokenAddress()
    assert.equal(tokenAddressAfter, token.address)
  })

  it('should allow the lock owner to switch from erc20 => erc20', async () => {})
  it('should allow the lock owner to switch from erc20 => eth', async () => {})
  it('should provide a refund in the new pricing token', async () => {})
})
