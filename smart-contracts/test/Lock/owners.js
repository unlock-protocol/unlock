const assert = require('assert')
const { ethers } = require('hardhat')
const {
  deployLock,
  purchaseKeys,
  ADDRESS_ZERO,
  compareBigNumbers,
  purchaseKey,
} = require('../helpers')
const { ZeroAddress } = require('ethers')

let lock
let tokenIds
let keyOwners
let random

describe('Lock / owners', () => {
  before(async () => {
    random = (await ethers.getSigners())[10]
    lock = await deployLock()
    await lock.updateTransferFee(0) // disable the transfer fee for this test
  })

  before(async () => {
    // Purchase keys!
    ;({ tokenIds, keyOwners } = await purchaseKeys(lock, 6))
    keyOwners = await Promise.all(
      await keyOwners.map((k) => ethers.getSigner(k))
    )
  })

  it('should have the right number of keys', async () => {
    const totalSupply = await lock.totalSupply()
    compareBigNumbers(totalSupply, keyOwners.length)
  })

  it('should have the right number of owners', async () => {
    const numberOfOwners = await lock.numberOfOwners()
    compareBigNumbers(numberOfOwners, keyOwners.length)
  })

  describe('after a transfer to a new address', () => {
    let numberOfOwners

    before(async () => {
      numberOfOwners = await lock.numberOfOwners()
      await lock
        .connect(keyOwners[0])
        .transferFrom(
          await keyOwners[0].getAddress(),
          await random.getAddress(),
          tokenIds[0]
        )
    })

    it('should have the right number of keys', async () => {
      compareBigNumbers(await lock.totalSupply(), tokenIds.length)
    })

    it('should have the right number of owners', async () => {
      compareBigNumbers(await lock.balanceOf(await random.getAddress()), 1)
      compareBigNumbers(
        await lock.balanceOf(await keyOwners[0].getAddress()),
        0
      )
      compareBigNumbers(await lock.numberOfOwners(), numberOfOwners)
    })
  })

  describe('after a transfer to an existing owner', () => {
    let numberOfOwners

    before(async () => {
      numberOfOwners = await lock.numberOfOwners()

      // both have tokens
      compareBigNumbers(
        await lock.balanceOf(await keyOwners[1].getAddress()),
        1
      )
      compareBigNumbers(
        await lock.balanceOf(await keyOwners[2].getAddress()),
        1
      )
      await lock
        .connect(keyOwners[1])
        .transferFrom(
          await keyOwners[1].getAddress(),
          await keyOwners[2].getAddress(),
          tokenIds[1]
        )
    })

    it('should have the right number of keys', async () => {
      compareBigNumbers(await lock.totalSupply(), tokenIds.length)
    })

    it('should have the right number of owners', async () => {
      compareBigNumbers(await lock.numberOfOwners(), numberOfOwners - 1n)
    })
  })

  // test case proofing https://github.com/code-423n4/2021-11-unlock-findings/issues/120
  describe('after a transfer to a existing owner, buying a key again for someone who already owned one', () => {
    it('should preserve the right number of owners', async () => {
      // initial state
      const numberOfOwners = await lock.numberOfOwners()
      const totalSupplyBefore = await lock.totalSupply()

      // transfer the key to an existing owner
      assert.equal(await lock.balanceOf(await keyOwners[4].getAddress()), 1)
      await lock
        .connect(keyOwners[3])
        .transferFrom(
          await keyOwners[3].getAddress(),
          await keyOwners[4].getAddress(),
          tokenIds[3]
        )
      compareBigNumbers(
        await lock.ownerOf(tokenIds[3]),
        await keyOwners[4].getAddress()
      )
      compareBigNumbers(
        await lock.balanceOf(await keyOwners[4].getAddress()),
        2
      )
      compareBigNumbers(
        await lock.balanceOf(await keyOwners[3].getAddress()),
        0
      )

      // supply unchanged
      compareBigNumbers(totalSupplyBefore, await lock.totalSupply())

      // number of owners changed
      compareBigNumbers(numberOfOwners - 1n, await lock.numberOfOwners())

      // someone buys a key again for the previous owner
      await lock.purchase(
        [],
        [await keyOwners[3].getAddress()],
        [ADDRESS_ZERO],
        [ADDRESS_ZERO],
        ['0x'],
        {
          value: await lock.keyPrice(),
        }
      )

      // number of owners should be left unchanged
      const _numberOfOwners = await lock.numberOfOwners()
      compareBigNumbers(_numberOfOwners, numberOfOwners)
    })
  })

  describe('ignore the null address', () => {
    it('does not increase owners count when user still own a key', async () => {
      const anotherSigner = (await ethers.getSigners())[8]
      const numberOfOwnersBefore = await lock.numberOfOwners()

      // purchase 1 key
      await purchaseKey(lock, await anotherSigner.getAddress())
      const numberOfOwners = await lock.numberOfOwners()
      assert.equal(numberOfOwners, numberOfOwnersBefore + 1n)

      // purchase a second key
      const { tokenId: newTokenId } = await purchaseKey(
        lock,
        await anotherSigner.getAddress()
      )
      // owners count still unchanged
      assert.equal(numberOfOwners, await lock.numberOfOwners())
      assert.equal(await lock.balanceOf(await anotherSigner.getAddress()), 2)

      // transfer the new key to null address
      await lock
        .connect(anotherSigner)
        .transferFrom(await anotherSigner.getAddress(), ZeroAddress, newTokenId)

      // owners count still unchanged
      assert.equal(numberOfOwners, await lock.numberOfOwners())
      assert.equal(await lock.balanceOf(await anotherSigner.getAddress()), 1)
    })

    it('does decrease the owners count when user has no key left', async () => {
      const numberOfOwners = await lock.numberOfOwners()
      assert.equal(await lock.balanceOf(await keyOwners[5].getAddress()), 1)
      await lock
        .connect(keyOwners[5])
        .transferFrom(await keyOwners[5].getAddress(), ZeroAddress, tokenIds[5])
      // expected count is actually -1 as transferring to zero address is equivalent to removing one owner
      assert.equal(numberOfOwners - 1n, await lock.numberOfOwners())
      assert.equal(await lock.balanceOf(await keyOwners[5].getAddress()), 0)
    })
  })
})
