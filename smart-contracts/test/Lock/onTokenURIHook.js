const { constants } = require('hardlydifficult-ethereum-contracts')
const { reverts } = require('truffle-assertions')
const deployLocks = require('../helpers/deployLocks')

const unlockContract = artifacts.require('Unlock.sol')
const TestEventHooks = artifacts.require('TestEventHooks.sol')
const getProxy = require('../helpers/proxy')

let lock
let locks
let unlock
let testEventHooks

contract('Lock / onKeyCancelHook', (accounts) => {
  const from = accounts[1]
  const to = accounts[2]
  let tokenId

  before(async () => {
    unlock = await getProxy(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
    lock = locks.FIRST
    testEventHooks = await TestEventHooks.new()
    await lock.setEventHooks(
      constants.ZERO_ADDRESS,
      constants.ZERO_ADDRESS,
      testEventHooks.address
    )
    const keyPrice = await lock.keyPrice()
    await lock.purchase(0, to, constants.ZERO_ADDRESS, [], {
      from,
      value: keyPrice,
    })
    tokenId = await lock.getTokenIdFor.call(to)
  })

  it('key cancels should log the hook event', async () => {
    const baseTokenURI = 'https://unlock-uri-hook.test/'
    const expirationTimestamp = await lock.keyExpirationTimestampFor(to)
    const tokenURI = `${baseTokenURI}${lock.address.toLowerCase()}/${accounts[3].toLowerCase()}/${expirationTimestamp}/${tokenId}`
    assert.equal(await lock.tokenURI(tokenId, { from: accounts[3] }), tokenURI)
  })

  it('cannot set the hook to a non-contract address', async () => {
    await reverts(
      lock.setEventHooks(
        constants.ZERO_ADDRESS,
        constants.ZERO_ADDRESS,
        accounts[3]
      ),
      'INVALID_ON_TOKEN_URI_HOOK'
    )
  })
})
