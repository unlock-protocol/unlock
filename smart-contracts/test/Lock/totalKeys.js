const { ethers } = require('hardhat')
const { getEvents } = require('@unlock-protocol/hardhat-helpers')
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
      [
        await keyOwner.getAddress(),
        await keyOwner.getAddress(),
        await keyOwner.getAddress(),
      ],
      [ADDRESS_ZERO, ADDRESS_ZERO, ADDRESS_ZERO],
      [ADDRESS_ZERO, ADDRESS_ZERO, ADDRESS_ZERO],
      ['0x', '0x', '0x'],
      {
        value: ethers.parseUnits('0.03', 'ether'),
      }
    )
    const receipt = await tx.wait()
    const { events } = await getEvents(receipt, 'Transfer')
    tokenIds = events.map(({ args }) => args.tokenId)
  })

  it('should count all valid keys', async () => {
    compareBigNumbers(await lock.totalKeys(await keyOwner.getAddress()), 3)
  })

  it('should count expired keys', async () => {
    // expire all keys
    const expirationTs = await lock.keyExpirationTimestampFor(tokenIds[0])
    await increaseTimeTo(expirationTs + 10n)

    compareBigNumbers(await lock.balanceOf(await keyOwner.getAddress()), 0)
    compareBigNumbers(await lock.totalKeys(await keyOwner.getAddress()), 3)
  })

  it('should count both expired and renewed keys', async () => {
    // extend once to fix block time in the past in test
    await lock.extend(0, tokenIds[0], ADDRESS_ZERO, '0x', {
      value: ethers.parseUnits('0.03', 'ether'),
      from: await keyOwner.getAddress(),
    })

    // expire all keys
    const expirationTs = await lock.keyExpirationTimestampFor(tokenIds[0])
    await increaseTimeTo(expirationTs + 10n)

    compareBigNumbers(await lock.totalKeys(await keyOwner.getAddress()), 3)
    compareBigNumbers(await lock.balanceOf(await keyOwner.getAddress()), 0)

    // renew one
    await lock.connect(keyOwner).extend(0, tokenIds[0], ADDRESS_ZERO, '0x', {
      value: ethers.parseUnits('0.03', 'ether'),
    })

    compareBigNumbers(await lock.balanceOf(await keyOwner.getAddress()), 1)
    compareBigNumbers(await lock.totalKeys(await keyOwner.getAddress()), 3)
  })
})
