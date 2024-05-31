const assert = require('assert')
const { ethers } = require('hardhat')
const { ADDRESS_ZERO, deployLock, reverts } = require('../helpers')
const { getEvent } = require('@unlock-protocol/hardhat-helpers')

let lock
let lockSingleKey
let tokenId
let keyOwner,
  receiver,
  someone, // the person who key is lended to
  random

describe('Lock / unlendKey', () => {
  beforeEach(async () => {
    ;[keyOwner, receiver, someone, random] = await ethers.getSigners()
    lock = await deployLock()
    lockSingleKey = await deployLock({ name: 'SINGLE KEY' })
    await lock.updateTransferFee(0) // disable the lend fee for this test
    await lockSingleKey.updateTransferFee(0) // disable the lend fee for this test

    const tx = await lock.purchase(
      [],
      [await keyOwner.getAddress()],
      [ADDRESS_ZERO],
      [ADDRESS_ZERO],
      ['0x'],
      {
        value: await lock.keyPrice(),
      }
    )

    const receipt = await tx.wait()
    ;({
      args: { tokenId },
    } = await getEvent(receipt, 'Transfer'))

    // lend a key to someone
    await lock
      .connect(keyOwner)
      .lendKey(await keyOwner.getAddress(), await someone.getAddress(), tokenId)
  })

  describe('failures', () => {
    it('should abort when there is no key to lend', async () => {
      await reverts(
        lock.unlendKey(await receiver.getAddress(), 999),
        'UNAUTHORIZED'
      )
    })

    it('should abort when caller is not a key manager', async () => {
      await reverts(
        lock.connect(random).unlendKey(await receiver.getAddress(), tokenId),
        'UNAUTHORIZED'
      )
    })

    it('should abort when caller is the account that currently owns the key', async () => {
      await reverts(
        lock.connect(receiver).unlendKey(await receiver.getAddress(), tokenId),
        'UNAUTHORIZED'
      )
    })
  })

  describe('when caller is the key manager', () => {
    beforeEach(async () => {
      await lock
        .connect(keyOwner)
        .unlendKey(await receiver.getAddress(), tokenId)
    })

    it('transfer ownership back to the specified recipient', async () => {
      assert.equal(await lock.ownerOf(tokenId), await receiver.getAddress())
    })

    it('update key validity properly', async () => {
      assert.equal(await lock.getHasValidKey(await someone.getAddress()), false)
      assert.equal(await lock.getHasValidKey(await receiver.getAddress()), true)
    })

    it('retains the correct key manager', async () => {
      assert.equal(
        await lock.keyManagerOf(tokenId),
        await keyOwner.getAddress()
      )
    })
  })
})
