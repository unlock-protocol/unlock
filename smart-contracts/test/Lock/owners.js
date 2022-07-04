const { ethers } = require('hardhat')
const { assert } = require('chai')
const { deployLock, purchaseKeys, ADDRESS_ZERO } = require('../helpers')

let lock
let tokenIds
let keyOwners, anotherAccount

describe('Lock / owners', () => {
  before(async () => {
    const [, ...signers] = await ethers.getSigners()
    keyOwners = signers.slice(0, 5)
    anotherAccount = signers[6]

    lock = await deployLock()
    await lock.setMaxKeysPerAddress(10)
    await lock.updateTransferFee(0) // disable the transfer fee for this test

    // buy keys
    ;({ tokenIds } = await purchaseKeys(lock, keyOwners.length))
  })

  describe('basic state', () => {
    it('should have the right number of keys', async () => {
      const totalSupply = await lock.totalSupply()
      assert.equal(totalSupply.toNumber(), keyOwners.length)
    })

    it('should have the right number of owners', async () => {
      const numberOfOwners = await lock.numberOfOwners()
      assert.equal(numberOfOwners.toNumber(), keyOwners.length)
    })
  })

  describe('after a transfer to a new address', () => {
    let numberOfOwners
    before(async () => {
      numberOfOwners = await lock.numberOfOwners()
      await lock
        .connect(keyOwners[0])
        .transferFrom(keyOwners[0].address, anotherAccount.address, tokenIds[0])
    })

    it('should have the right number of keys', async () => {
      const totalSupply = await lock.totalSupply()
      assert.equal(totalSupply.toNumber(), tokenIds.length)
    })

    it('should have the right number of owners', async () => {
      assert.equal(await lock.balanceOf(anotherAccount.address), 1)
      assert.equal(await lock.balanceOf(keyOwners[0].address), 0)
      const _numberOfOwners = await lock.numberOfOwners()
      assert.equal(_numberOfOwners.toNumber(), numberOfOwners.toNumber())
    })
  })

  describe('after a transfer to an existing owner', () => {
    let numberOfOwners

    before(async () => {
      numberOfOwners = await lock.numberOfOwners()

      // both have tokens
      assert.equal(await lock.balanceOf(keyOwners[1].address), 1)
      assert.equal(await lock.balanceOf(keyOwners[2].address), 1)
      await lock
        .connect(keyOwners[1])
        .transferFrom(keyOwners[1].address, keyOwners[2].address, tokenIds[1])
    })

    it('should have the right number of keys', async () => {
      const totalSupply = await lock.totalSupply()
      assert.equal(totalSupply.toNumber(), tokenIds.length)
    })

    it('should have the right number of owners', async () => {
      const _numberOfOwners = await lock.numberOfOwners()
      assert.equal(_numberOfOwners.toNumber(), numberOfOwners.toNumber() - 1)
    })
  })

  // test case proofing https://github.com/code-423n4/2021-11-unlock-findings/issues/120
  describe('after a transfer to a existing owner, buying a key again for someone who already owned one', () => {
    it('should preserve the right number of owners', async () => {
      // initial state
      const numberOfOwners = await lock.numberOfOwners()
      const totalSupplyBefore = await lock.totalSupply()

      // transfer the key to an existing owner
      assert.equal((await lock.balanceOf(keyOwners[4].address)).toNumber(), 1)
      await lock
        .connect(keyOwners[3])
        .transferFrom(keyOwners[3].address, keyOwners[4].address, tokenIds[3])
      assert.equal(await lock.ownerOf(tokenIds[3]), keyOwners[4].address)
      assert.equal((await lock.balanceOf(keyOwners[4].address)).toNumber(), 2)
      assert.equal((await lock.balanceOf(keyOwners[3].address)).toNumber(), 0)

      // supply unchanged
      const totalSupplyAfter = await lock.totalSupply()
      assert.equal(totalSupplyBefore.toNumber(), totalSupplyAfter.toNumber())

      // number of owners changed
      assert.equal(
        numberOfOwners.sub(1).toNumber(),
        (await lock.numberOfOwners()).toNumber()
      )

      // someone buys a key again for the previous owner
      await lock.purchase(
        [],
        [keyOwners[3].address],
        [ADDRESS_ZERO],
        [ADDRESS_ZERO],
        [[]],
        {
          value: await lock.keyPrice(),
        }
      )

      // number of owners should be left unchanged
      const _numberOfOwners = await lock.numberOfOwners()
      assert.equal(_numberOfOwners.toNumber(), numberOfOwners.toNumber())
    })
  })
})
