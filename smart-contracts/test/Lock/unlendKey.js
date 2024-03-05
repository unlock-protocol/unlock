const { assert } = require('chai')
const { ethers } = require('hardhat')
const { ADDRESS_ZERO, deployLock, reverts } = require('../helpers')

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
      [keyOwner.address],
      [ADDRESS_ZERO],
      [ADDRESS_ZERO],
      [[]],
      {
        value: await lock.keyPrice(),
      }
    )

    const { events } = await tx.wait()
    ;[tokenId] = events
      .filter((v) => v.event === 'Transfer')
      .map(({ args }) => args.tokenId)

    // lend a key to someone
    await lock
      .connect(keyOwner)
      .lendKey(keyOwner.address, someone.address, tokenId)
  })

  describe('failures', () => {
    it('should abort when there is no key to lend', async () => {
      await reverts(lock.unlendKey(receiver.address, 999), 'UNAUTHORIZED')
    })

    it('should abort when caller is not a key manager', async () => {
      await reverts(
        lock.connect(random).unlendKey(receiver.address, tokenId),
        'UNAUTHORIZED'
      )
    })

    it('should abort when caller is the account that currently owns the key', async () => {
      await reverts(
        lock.connect(receiver).unlendKey(receiver.address, tokenId),
        'UNAUTHORIZED'
      )
    })
  })

  describe('when caller is the key manager', () => {
    beforeEach(async () => {
      await lock.connect(keyOwner).unlendKey(receiver.address, tokenId)
    })

    it('transfer ownership back to the specified recipient', async () => {
      assert.equal(await lock.ownerOf(tokenId), receiver.address)
    })

    it('update key validity properly', async () => {
      assert.equal(await lock.getHasValidKey(someone.address), false)
      assert.equal(await lock.getHasValidKey(receiver.address), true)
    })

    it('retains the correct key manager', async () => {
      assert.equal(await lock.keyManagerOf(tokenId), keyOwner.address)
    })
  })
})
