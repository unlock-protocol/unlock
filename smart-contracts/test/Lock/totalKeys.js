const { ethers } = require('hardhat')

const {
  ADDRESS_ZERO,
  increaseTimeTo,
  deployLock,
  compareBigNumbers,
} = require('../helpers')

let lock
let tokenIds
let keyOwner

describe('Lock / totalKeys', () => {
  before(async () => {
    lock = await deployLock()
    ;[keyOwner] = await ethers.getSigners()
    const tx = await lock.purchase(
      [],
      [keyOwner.address, keyOwner.address, keyOwner.address],
      [ADDRESS_ZERO, ADDRESS_ZERO, ADDRESS_ZERO],
      [ADDRESS_ZERO, ADDRESS_ZERO, ADDRESS_ZERO],
      [[], [], []],
      {
        value: ethers.utils.parseUnits('0.03', 'ether'),
      }
    )
    const { events } = await tx.wait()
    tokenIds = events
      .filter((v) => v.event === 'Transfer')
      .map(({ args }) => args.tokenId)
  })

  it('should count all valid keys', async () => {
    compareBigNumbers(await lock.totalKeys(keyOwner.address), 3)
  })

  it('should count expired keys', async () => {
    // expire all keys
    const expirationTs = await lock.keyExpirationTimestampFor(tokenIds[0])
    await increaseTimeTo(expirationTs.add(10))

    compareBigNumbers(await lock.balanceOf(keyOwner.address), 0)
    compareBigNumbers(await lock.totalKeys(keyOwner.address), 3)
  })

  it('should count both expired and renewed keys', async () => {
    // extend once to fix block time in the past in test
    await lock.extend(0, tokenIds[0], ADDRESS_ZERO, [], {
      value: ethers.utils.parseUnits('0.03', 'ether'),
      from: keyOwner.address,
    })

    // expire all keys
    const expirationTs = await lock.keyExpirationTimestampFor(tokenIds[0])
    await increaseTimeTo(expirationTs.add(10))

    compareBigNumbers(await lock.totalKeys(keyOwner.address), 3)
    compareBigNumbers(await lock.balanceOf(keyOwner.address), 0)

    // renew one
    await lock.connect(keyOwner).extend(0, tokenIds[0], ADDRESS_ZERO, [], {
      value: ethers.utils.parseUnits('0.03', 'ether'),
    })

    compareBigNumbers(await lock.balanceOf(keyOwner.address), 1)
    compareBigNumbers(await lock.totalKeys(keyOwner.address), 3)
  })
})
