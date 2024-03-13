const { assert } = require('chai')
const { ethers } = require('hardhat')

const {
  deployLock,
  ADDRESS_ZERO,
  compareBigNumbers,
  increaseTimeTo,
} = require('../../helpers')

describe('Lock / erc721 / balanceOf', () => {
  let lock
  let keyOwner, someAccount, accountWithoutKey, keyReceiver
  before(async () => {
    ;[, keyOwner, someAccount, accountWithoutKey, keyReceiver] =
      await ethers.getSigners()
    lock = await deployLock()
  })

  it('should return 0 if the user has no key', async () => {
    const balance = await lock.balanceOf(accountWithoutKey.address)
    compareBigNumbers(balance, 0)
  })

  it('should return correct number of keys', async () => {
    await lock.purchase(
      [],
      [someAccount.address, someAccount.address, someAccount.address],
      [ADDRESS_ZERO, ADDRESS_ZERO, ADDRESS_ZERO],
      [ADDRESS_ZERO, ADDRESS_ZERO, ADDRESS_ZERO],
      [[], [], []],
      {
        value: ethers.utils.parseUnits('0.03', 'ether'),
      }
    )
    compareBigNumbers(await lock.balanceOf(someAccount.address), 3)
  })

  it('should count only valid keys', async () => {
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
    const tokenIds = events
      .filter((v) => v.event === 'Transfer')
      .map(({ args }) => args.tokenId)

    compareBigNumbers(await lock.balanceOf(keyOwner.address), 3)

    // expire all keys
    const expirationTs = await lock.keyExpirationTimestampFor(tokenIds[0])
    await increaseTimeTo(expirationTs.add(10))

    compareBigNumbers(await lock.balanceOf(keyOwner.address), 0)

    // renew one
    await lock.extend(0, tokenIds[0], ADDRESS_ZERO, [], {
      value: ethers.utils.parseUnits('0.03', 'ether'),
    })

    compareBigNumbers(await lock.balanceOf(keyOwner.address), 1)
  })

  it('should return correct number after key transfers', async () => {
    const tx = await lock.purchase(
      [],
      [keyReceiver.address, keyReceiver.address, keyReceiver.address],
      [ADDRESS_ZERO, ADDRESS_ZERO, ADDRESS_ZERO],
      [ADDRESS_ZERO, ADDRESS_ZERO, ADDRESS_ZERO],
      [[], [], []],
      {
        value: ethers.utils.parseUnits('0.03', 'ether'),
      }
    )
    const { events } = await tx.wait()

    const [tokenId] = events
      .filter((v) => v.event === 'Transfer')
      .map(({ args }) => args.tokenId)

    compareBigNumbers(await lock.balanceOf(keyReceiver.address), 3)
    compareBigNumbers(
      tokenId,
      await lock.tokenOfOwnerByIndex(keyReceiver.address, 0)
    )
    assert.equal(keyReceiver.address, await lock.ownerOf(tokenId))

    await lock
      .connect(keyReceiver)
      .transferFrom(keyReceiver.address, accountWithoutKey.address, tokenId)
    assert.equal(await lock.balanceOf(keyReceiver.address), 2)
    assert.equal(await lock.balanceOf(accountWithoutKey.address), 1)
  })
})
