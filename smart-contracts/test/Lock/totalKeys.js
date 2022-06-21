const { time } = require('@openzeppelin/test-helpers')

const deployLocks = require('../helpers/deployLocks')
const unlockContract = artifacts.require('Unlock.sol')
const getContractInstance = require('../helpers/truffle-artifacts')
const { ADDRESS_ZERO } = require('../helpers/constants')

let unlock
let lock
let tokenIds

contract('Lock / totalKeys', (accounts) => {
  let owner = accounts[0]

  before(async () => {
    unlock = await getContractInstance(unlockContract)
    const locks = await deployLocks(unlock, owner)
    lock = locks.FIRST
    await lock.setMaxKeysPerAddress(10)

    const tx = await lock.purchase(
      [],
      [accounts[1], accounts[1], accounts[1]],
      [ADDRESS_ZERO, ADDRESS_ZERO, ADDRESS_ZERO],
      [ADDRESS_ZERO, ADDRESS_ZERO, ADDRESS_ZERO],
      [[], [], []],
      {
        value: web3.utils.toWei('0.03', 'ether'),
        from: accounts[1],
      }
    )

    tokenIds = tx.logs
      .filter((v) => v.event === 'Transfer')
      .map(({ args }) => args.tokenId)
  })

  it('should count all valid keys', async () => {
    assert.equal((await lock.totalKeys(accounts[1])).toNumber(), 3)
  })

  it('should count expired keys', async () => {
    // expire all keys
    const expirationTs = await lock.keyExpirationTimestampFor(tokenIds[0])
    await time.increaseTo(expirationTs.toNumber() + 10)

    assert.equal((await lock.totalKeys(accounts[1])).toNumber(), 3)
  })

  it('should count both expired and renewed keys', async () => {
    // extend once to fix block time in the past in test
    await lock.extend(0, tokenIds[0], ADDRESS_ZERO, [], {
      value: web3.utils.toWei('0.03', 'ether'),
      from: accounts[1],
    })

    // expire all keys
    const expirationTs = await lock.keyExpirationTimestampFor(tokenIds[0])
    await time.increaseTo(expirationTs.toNumber() + 10)

    assert.equal((await lock.totalKeys(accounts[1])).toNumber(), 3)

    // renew one
    await lock.extend(0, tokenIds[0], ADDRESS_ZERO, [], {
      value: web3.utils.toWei('0.03', 'ether'),
      from: accounts[1],
    })

    assert.equal((await lock.totalKeys(accounts[1])).toNumber(), 3)
  })
})
