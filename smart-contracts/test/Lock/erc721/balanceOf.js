const assert = require('assert')
const { ethers } = require('hardhat')
const { getEvent, getEvents } = require('@unlock-protocol/hardhat-helpers')
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
    const balance = await lock.balanceOf(await accountWithoutKey.getAddress())
    compareBigNumbers(balance, 0)
  })

  it('should return correct number of keys', async () => {
    await lock.purchase(
      [],
      [
        await someAccount.getAddress(),
        await someAccount.getAddress(),
        await someAccount.getAddress(),
      ],
      [ADDRESS_ZERO, ADDRESS_ZERO, ADDRESS_ZERO],
      [ADDRESS_ZERO, ADDRESS_ZERO, ADDRESS_ZERO],
      ['0x', '0x', '0x'],
      {
        value: ethers.parseUnits('0.03', 'ether'),
      }
    )
    compareBigNumbers(await lock.balanceOf(await someAccount.getAddress()), 3)
  })

  it('should count only valid keys', async () => {
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
    const tokenIds = events.map(({ args }) => args.tokenId)

    compareBigNumbers(await lock.balanceOf(await keyOwner.getAddress()), 3)

    // expire all keys
    const expirationTs = await lock.keyExpirationTimestampFor(tokenIds[0])
    await increaseTimeTo(expirationTs + 10n)

    compareBigNumbers(await lock.balanceOf(await keyOwner.getAddress()), 0)

    // renew one
    await lock.extend(0, tokenIds[0], ADDRESS_ZERO, '0x', {
      value: ethers.parseUnits('0.03', 'ether'),
    })

    compareBigNumbers(await lock.balanceOf(await keyOwner.getAddress()), 1)
  })

  it('should return correct number after key transfers', async () => {
    const tx = await lock.purchase(
      [],
      [
        await keyReceiver.getAddress(),
        await keyReceiver.getAddress(),
        await keyReceiver.getAddress(),
      ],
      [ADDRESS_ZERO, ADDRESS_ZERO, ADDRESS_ZERO],
      [ADDRESS_ZERO, ADDRESS_ZERO, ADDRESS_ZERO],
      ['0x', '0x', '0x'],
      {
        value: ethers.parseUnits('0.03', 'ether'),
      }
    )
    const receipt = await tx.wait()

    const {
      args: { tokenId },
    } = await getEvent(receipt, 'Transfer')

    compareBigNumbers(await lock.balanceOf(await keyReceiver.getAddress()), 3)
    compareBigNumbers(
      tokenId,
      await lock.tokenOfOwnerByIndex(await keyReceiver.getAddress(), 0)
    )
    assert.equal(await keyReceiver.getAddress(), await lock.ownerOf(tokenId))

    await lock
      .connect(keyReceiver)
      .transferFrom(
        await keyReceiver.getAddress(),
        await accountWithoutKey.getAddress(),
        tokenId
      )
    assert.equal(await lock.balanceOf(await keyReceiver.getAddress()), 2)
    assert.equal(await lock.balanceOf(await accountWithoutKey.getAddress()), 1)
  })
})
