const unlockContract = artifacts.require('Unlock.sol')
const TestErc20Token = artifacts.require('TestErc20Token.sol')
const getUnlockProxy = require('../helpers/proxy')
const shouldFail = require('../helpers/shouldFail')

let unlock, token

contract('Unlock / erc20', accounts => {
  before(async () => {
    unlock = await getUnlockProxy(unlockContract)
    token = await TestErc20Token.new()
  })

  it('should fail to create an ERC20 priced lock (TODO)', async function() {
    await shouldFail(
      unlock.createLock(
        60 * 60 * 24 * 30, // expirationDuration: 30 days
        token.address,
        42, // keyPrice: in tokens
        100 // maxNumberOfKeys
      ),
      'NOT_IMPLEMENTED'
    )
  })
})
